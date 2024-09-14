// src/app/services/page.js
import React from 'react';

const servicesList = [
  {
    title: 'Get Aadhaar',
    description: 'Apply for your Aadhaar card online.',
  },
  {
    title: 'Update Your Aadhaar',
    description: 'Update your personal details in your Aadhaar.',
  },
  {
    title: 'Download Aadhaar',
    description: 'Download an electronic copy of your Aadhaar.',
  },
  {
    title: 'Verify Aadhaar Number',
    description: 'Verify if an Aadhaar number is valid or not.',
  },
  // Add more services as needed
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servicesList.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p>{service.description}</p>
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
