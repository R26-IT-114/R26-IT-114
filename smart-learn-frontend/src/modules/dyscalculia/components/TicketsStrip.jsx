import React from 'react';

const TicketsStrip = ({ tickets = 0 }) => {
  return (
    <div className="dashboard-ticket-strip" aria-label="Tickets earned">
      <span role="img" aria-hidden="true">🎟️</span>
      <span className="ticket-count">{tickets}</span>
      <span className="ticket-label">tickets</span>
    </div>
  );
};

export default TicketsStrip;

