
import React from 'react';
import LandingPage from '../components/landing/LandingPage';
import { DialogProvider } from '../context/DialogContext';
import DialogContainer from '../components/dialogs/DialogContainer';

const Index = () => {
  return (
    <DialogProvider>
      <LandingPage />
      <DialogContainer />
    </DialogProvider>
  );
};

export default Index;
