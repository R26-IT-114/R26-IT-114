import { useEffect, useMemo, useState } from 'react';
import {
  createAdminAuditLog,
  DEFAULT_RECOMMENDATIONS,
  listUserProfiles,
  MAX_RECOMMENDATIONS_PER_USER,
  VALID_RECOMMENDATION_PATHS,
  updateUserRecommendations,
  updateUserRole,
} from '../services/firebaseUserProfile';
import { logTelemetryError } from '../services/telemetry';
import useAuth from '../hooks/useAuth';

const parseRecommendationsInput = (value) => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, path, reason = ''] = line.split('|').map((part) => part.trim());
      return {
        label,
        path,
        reason,
      };
    })
    .filter((item) => item.label && item.path);
};

const validateRecommendations = (recommendations) => {
  if (recommendations.length === 0) {
    return 'Add at least one recommendation in the format: label | /path | reason';
  }

  if (recommendations.length > MAX_RECOMMENDATIONS_PER_USER) {
    return `Only ${MAX_RECOMMENDATIONS_PER_USER} recommendations are allowed per user.`;
  }

  const invalidPaths = recommendations
    .map((item) => item.path)
    .filter((path) => !VALID_RECOMMENDATION_PATHS.includes(path));

  if (invalidPaths.length > 0) {
    return `Invalid module paths detected: ${[...new Set(invalidPaths)].join(', ')}`;
  }

  return '';
};

const serializeRecommendationsInput = (recommendations) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return '';
  }

  return recommendations.map((item) => `${item.label} | ${item.path} | ${item.reason || ''}`).join('\n');
};

const AdminRecommendations = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [selectedUid, setSelectedUid] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [lastSaveInput, setLastSaveInput] = useState('');
  const [canRetrySave, setCanRetrySave] = useState(false);
  const [canRetryLoad, setCanRetryLoad] = useState(false);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.uid === selectedUid) || null,
    [profiles, selectedUid]
  );

  const filteredProfiles = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return profiles;
    }

    return profiles.filter((profile) => {
      const name = (profile.name || '').toLowerCase();
      const email = (profile.email || '').toLowerCase();
      return name.includes(normalized) || email.includes(normalized);
    });
  }, [profiles, search]);

  const loadProfiles = async (isMounted = () => true) => {
    setIsLoading(true);
    setCanRetryLoad(false);

    try {
      const fetched = await listUserProfiles();

      if (!isMounted()) return;

      setProfiles(fetched);
      setError('');

      if (fetched.length > 0) {
        setSelectedUid((currentUid) => currentUid || fetched[0].uid);
      }
    } catch (loadError) {
      if (isMounted()) {
        setError('Failed to load user profiles from Firestore.');
        setCanRetryLoad(true);
      }

      logTelemetryError('admin-recommendations-load', loadError);
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    loadProfiles(isMounted);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSuccess('');

    if (!selectedProfile) {
      setEditorValue('');
      return;
    }

    const existing = selectedProfile.recommendations?.length
      ? selectedProfile.recommendations
      : DEFAULT_RECOMMENDATIONS;

    setEditorValue(serializeRecommendationsInput(existing));
    setSelectedRole(selectedProfile.role || 'student');
    setCanRetrySave(false);
  }, [selectedProfile]);

  const safeAuditLog = async (payload) => {
    if (!user?.id) return;

    try {
      await createAdminAuditLog(payload);
    } catch (auditError) {
      logTelemetryError('admin-audit-log-failed', auditError, payload);
    }
  };

  const handleSave = async (inputOverride) => {
    if (!selectedProfile?.uid) {
      setError('Select a user profile first.');
      return;
    }

    const rawInput = typeof inputOverride === 'string' ? inputOverride : editorValue;
    const parsed = parseRecommendationsInput(rawInput);

    const validationError = validateRecommendations(parsed);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    setCanRetrySave(false);
    setLastSaveInput(rawInput);

    try {
      const nextRecommendations = await updateUserRecommendations(selectedProfile.uid, parsed);

      await safeAuditLog({
        action: 'recommendations.update',
        actorUid: user?.id,
        actorRole: user?.role,
        targetUid: selectedProfile.uid,
        details: {
          recommendationCount: nextRecommendations.length,
          paths: nextRecommendations.map((item) => item.path),
        },
      });

      setProfiles((current) =>
        current.map((profile) =>
          profile.uid === selectedProfile.uid
            ? { ...profile, recommendations: nextRecommendations }
            : profile
        )
      );

      setSuccess('Recommendations saved successfully.');
    } catch (saveError) {
      setError('Unable to save recommendations. Check Firestore rules and try again.');
      setCanRetrySave(true);
      logTelemetryError('admin-recommendations-save', saveError, { uid: selectedProfile.uid });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedProfile?.uid) {
      setError('Select a user profile first.');
      return;
    }

    setIsUpdatingRole(true);
    setError('');
    setSuccess('');

    try {
      const nextRole = await updateUserRole(selectedProfile.uid, selectedRole);

      await safeAuditLog({
        action: 'user.role.update',
        actorUid: user?.id,
        actorRole: user?.role,
        targetUid: selectedProfile.uid,
        details: {
          role: nextRole,
        },
      });

      setProfiles((current) =>
        current.map((profile) =>
          profile.uid === selectedProfile.uid ? { ...profile, role: nextRole } : profile
        )
      );

      setSuccess('User role updated successfully.');
    } catch (roleError) {
      setError('Unable to update user role. Admin privileges are required.');
      logTelemetryError('admin-role-update', roleError, {
        uid: selectedProfile.uid,
        role: selectedRole,
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <main className='page-shell'>
      <section className='container'>
        <div className='card admin-card'>
          <h1 className='page-title'>Recommendations Admin</h1>
          <p className='page-subtitle'>
            Update each learner profile recommendation list using one entry per line:
            <strong> label | /module-path | reason</strong>
          </p>

          <p className='admin-hint'>
            Allowed module paths: {VALID_RECOMMENDATION_PATHS.join(', ')}. Maximum {MAX_RECOMMENDATIONS_PER_USER} rows.
          </p>

          {error ? <p className='form-error'>{error}</p> : null}
          {success ? <p className='form-success'>{success}</p> : null}
          {canRetryLoad ? (
            <button className='btn-secondary' onClick={() => loadProfiles(() => true)} type='button'>
              Retry loading users
            </button>
          ) : null}
          {canRetrySave ? (
            <button
              className='btn-secondary'
              onClick={() => {
                if (!lastSaveInput) return;
                handleSave(lastSaveInput);
              }}
              type='button'
            >
              Retry save
            </button>
          ) : null}

          <div className='admin-layout'>
            <aside className='admin-users'>
              <input
                className='admin-search'
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search by name or email'
                type='search'
                value={search}
              />

              {isLoading ? <p className='recommend-state'>Loading users...</p> : null}
              {!isLoading && filteredProfiles.length === 0 ? (
                <p className='recommend-state recommend-state--empty'>No users found for this search.</p>
              ) : null}

              <div className='admin-user-list'>
                {filteredProfiles.map((profile) => (
                  <button
                    className={`admin-user-item ${selectedUid === profile.uid ? 'is-active' : ''}`}
                    key={profile.uid}
                    onClick={() => setSelectedUid(profile.uid)}
                    type='button'
                  >
                    <strong>{profile.name || 'Unnamed user'}</strong>
                    <span>{profile.email || profile.uid}</span>
                    <small>{profile.role}</small>
                  </button>
                ))}
              </div>
            </aside>

            <section className='admin-editor'>
              <h2>{selectedProfile?.name || selectedProfile?.email || 'Select a user'}</h2>
              <div className='admin-role-row'>
                <label htmlFor='roleSelect'>Role</label>
                <select
                  className='admin-role-select'
                  disabled={!selectedProfile || isUpdatingRole}
                  id='roleSelect'
                  onChange={(event) => setSelectedRole(event.target.value)}
                  value={selectedRole}
                >
                  <option value='student'>Student</option>
                  <option value='therapist'>Therapist</option>
                  <option value='admin'>Admin</option>
                </select>
                <button
                  className='btn-secondary'
                  disabled={!selectedProfile || isUpdatingRole}
                  onClick={handleRoleUpdate}
                  type='button'
                >
                  {isUpdatingRole ? 'Updating role...' : 'Update role'}
                </button>
              </div>

              <textarea
                className='admin-textarea'
                disabled={!selectedProfile}
                onChange={(event) => setEditorValue(event.target.value)}
                rows={10}
                value={editorValue}
              />

              <div className='admin-editor-actions'>
                <button className='btn-secondary' onClick={() => setEditorValue('')} type='button'>
                  Clear
                </button>
                <button
                  className='btn-primary'
                  disabled={isSaving || !selectedProfile}
                  onClick={handleSave}
                  type='button'
                >
                  {isSaving ? 'Saving...' : 'Save recommendations'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminRecommendations;
