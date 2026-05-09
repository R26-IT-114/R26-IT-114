import React from 'react';
import {
  Star,
  Sparkles,
  Trophy,
  PartyPopper,
  Flame,
  User,
  Medal,
  Music,
  Bell,
  Lightbulb,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Megaphone,
} from 'lucide-react';



export const StarIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <Star size={size} color={color} className={className} {...rest} />
);

export const SparklesIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <Sparkles size={size} color={color} className={className} {...rest} />
);

export const PartyIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <PartyPopper size={size} color={color} className={className} {...rest} />
);

export const TrophyIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <Trophy size={size} color={color} className={className} {...rest} />
);

export const FlameIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <Flame size={size} color={color} className={className} {...rest} />
);

export const ChildIcon = ({ size = 26, color = 'currentColor', className = '', ...rest }) => (
  <User size={size} color={color} className={className} {...rest} />
);

export const MedalIcon = ({ size = 18, color = 'currentColor', className = '', ...rest }) => (
  <Medal size={size} color={color} className={className} {...rest} />
);

export const LearningIcon = ({ size = 20, color = 'currentColor', className = '', ...rest }) => (
  <Lightbulb size={size} color={color} className={className} {...rest} />
);

export const MusicIcon = ({ size = 20, color = 'currentColor', className = '', ...rest }) => (
  <Music size={size} color={color} className={className} {...rest} />
);

export const TargetsIcon = ({ size = 20, color = 'currentColor', className = '', ...rest }) => (
  <Target size={size} color={color} className={className} {...rest} />
);

export const CheckIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <CheckCircle2 size={size} color={color} className={className} {...rest} />
);

export const WrongIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <XCircle size={size} color={color} className={className} {...rest} />
);

export const HelpIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <HelpCircle size={size} color={color} className={className} {...rest} />
);

export const MegaPhoneIcon = ({ size = 22, color = 'currentColor', className = '', ...rest }) => (
  <Megaphone size={size} color={color} className={className} {...rest} />
);

// Map an existing emoji-ish variant to a minimal icon.
// Keep API stable for overlay usage.
export const getOverlayIcon = ({ correct }) => {
  if (correct === true) return <CheckIcon size={40} className="dg-ico" />;
  if (correct === false) return <WrongIcon size={40} className="dg-ico" />;
  return <HelpIcon size={40} className="dg-ico" />;
};

export const getJourneyIcon = (key) => {
  // Simple minimal mapping; does not affect routing.
  switch (key) {
    case 'number-recognition':
      return <TargetsIcon size={20} className="dg-journey-ico" />;
    case 'counting':
      return <LearningIcon size={20} className="dg-journey-ico" />;
    case 'tracing':
      return <HelpIcon size={20} className="dg-journey-ico" />;
    case 'sorting':
      return <TrophyIcon size={20} className="dg-journey-ico" />;
    case 'listening':
      return <MusicIcon size={20} className="dg-journey-ico" />;
    default:
      return <Bell size={20} color={'currentColor'} className="dg-journey-ico" />;
  }
};

