import React from 'react';
import { Luggage, ShieldCheck, Info, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate from react-router-dom

const TicketFare = () => {
  const navigate = useNavigate(); // Initialize the navigate function to navigate between pages

  // Function to handle navigation to SeatingDetails page
  const handleNavigate = (fareType) => {
    navigate('/seating-details', { state: { fareType } }); // Pass the selected fare type as state
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 display-4">Your Fare Options</h1>

      <div className="row row-cols-1 row-cols-md-3 g-4"> {/* Bootstrap grid for card layout */}
        {/* Fare Option - Basic */}
        <motion.div className="col" whileHover={{ scale: 1.02 }}>
          <div className="card shadow-sm border-light rounded-lg d-flex flex-column h-100" >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title">Basic Fare</h5>
                <span className="h4 text-success">$299</span>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Luggage size={16} /> <span className="ms-2">Hand luggage: 1x 10kg</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <ShieldCheck size={16} /> <span className="ms-2">No refund</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Info size={16} /> <span className="ms-2">Seat selection: Not available</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <CalendarDays size={16} /> <span className="ms-2">Date changes: Not allowed</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary w-100" onClick={() => handleNavigate('Basic')}>Continue with Basic</button>
            </div>
          </div>
        </motion.div>

        {/* Fare Option - Plus */}
        <motion.div className="col" whileHover={{ scale: 1.02 }}>
          <div className="card shadow-md border-light rounded-lg d-flex flex-column h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title">Plus Fare</h5>
                <span className="h4 text-success">$349</span>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Luggage size={16} /> <span className="ms-2">Hand luggage: 1x 10kg</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <ShieldCheck size={16} /> <span className="ms-2">50% refund</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Info size={16} /> <span className="ms-2">Seat selection included</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <CalendarDays size={16} /> <span className="ms-2">One date change allowed</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-outline-primary w-100" onClick={() => handleNavigate('Plus')}>Choose Plus</button>
            </div>
          </div>
        </motion.div>

        {/* Fare Option - Premium */}
        <motion.div className="col" whileHover={{ scale: 1.02 }}>
          <div className="card shadow-lg border-light rounded-lg d-flex flex-column h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title">Premium Fare</h5>
                <span className="h4 text-success">$419</span>
              </div>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Luggage size={16} /> <span className="ms-2">Hand + Hold luggage</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <ShieldCheck size={16} /> <span className="ms-2">Full refund</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-2">
                    <Info size={16} /> <span className="ms-2">Priority boarding</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <CalendarDays size={16} /> <span className="ms-2">Unlimited date changes</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-danger w-100" onClick={() => handleNavigate('Premium')}>Go Premium</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketFare;
