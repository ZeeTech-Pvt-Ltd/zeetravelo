// StepProgressBar.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './StepProgressBar.css';

const steps = [
  { label: 'Search', path: '/' },
  { label: 'Passenger Details', path: '/booking-details' },
  { label: 'Baggage', path: '/baggage-details' },
  { label: 'Ticket Fare', path: '/ticket-fare' },
  { label: 'Seating', path: '/seating-details' },
  { label: 'Overview & Payment', path: '/final-overview' }
];

const StepProgressBar = () => {
  const location = useLocation();

  // Find the index of the current step based on the route path
  const currentStep = steps.findIndex(step => step.path === location.pathname);

  return (
    <div className="container mt-4">
      <div className="stepper d-flex justify-content-between position-relative mx-auto" style={{ maxWidth: '900px' }}>

        {steps.map((step, index) => (
          <div className="step d-flex flex-column align-items-center text-center" key={index}>
            <div
              className={`circle ${index <= currentStep ? 'active' : ''}`}
            >
              {index + 1}
            </div>
            <div className={`label ${index <= currentStep ? 'text-primary' : 'text-muted'}`}>
              {step.label}
            </div>
            {index < steps.length - 1 && <div className="connector" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgressBar;
