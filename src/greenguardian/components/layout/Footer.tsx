import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} GreenGuardian - AI for Local Environmental Monitoring</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:text-green-200 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-green-200 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm hover:text-green-200 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
