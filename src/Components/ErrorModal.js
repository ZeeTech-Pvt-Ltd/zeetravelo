import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorModal = ({ show, message, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose(); // Inform parent to hide the modal
    navigate('/'); // Redirect to homepage
  };

  const isTokenExpired = message?.toLowerCase().includes('token');

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <Modal.Header className="bg-danger text-white">
        <Modal.Title>
          <FaExclamationTriangle className="me-2 display-5" />
          Error
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center fs-5 py-4">
        {isTokenExpired ? (
          <p>Your session has expired. Please log in again from the homepage.</p>
        ) : (
          <p>{message || 'Something went wrong. Please try again later.'}</p>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="danger" onClick={handleClose} className="px-4">
          Go to Homepage
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
