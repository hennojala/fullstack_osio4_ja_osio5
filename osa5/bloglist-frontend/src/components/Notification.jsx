import React from 'react';


const Notification = ({ message, errormessage, confirmmessage }) => {
    if (message === null) {
      return null;
    }
    if (message === errormessage) {
      return <div className="error">{message}</div>;
    }
    if (message === confirmmessage) {
      return <div className="confirm">{message}</div>;
    }
  };


export default Notification;