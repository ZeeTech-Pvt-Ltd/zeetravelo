// components/BookingStepper.js
import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import './BookingStepper.css';

const steps = [
  'Search',
  'Passenger details',
  'Baggage',
  'Ticket fare',
  'Seating',
  'Overview & payment',
];

const BookingStepper = ({ currentStep }) => {
  return (
    <div className="booking-stepper py-4 px-2 bg-light border-bottom">
      <div className="d-flex justify-content-between align-items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <div key={index} className="text-center flex-fill position-relative">
              <div
                className={`step-circle mx-auto mb-2 ${
                  isActive ? 'active' : isCompleted ? 'completed' : ''
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <small className={`step-label ${isActive ? 'fw-bold' : ''}`}>
                {step}
              </small>
              {index < steps.length - 1 && (
                <div className="step-line d-none d-md-block"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepper;
