import React, { useState } from 'react';

interface RentalSpaceData {
  name: string;
  description: string;
  price: number;
  location: string;
  size: string;
}

interface MultiStepFormProps {
  onSubmit: (data: RentalSpaceData) => void;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<RentalSpaceData>({
    name: '',
    description: '',
    price: 0,
    location: '',
    size: '',
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const steps = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Location & Size' },
    { id: 3, title: 'Pricing' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                {step.id}
              </div>
              <p className="text-sm mt-2">{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Location & Size</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={data.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Size (sq ft)</label>
              <input
                type="text"
                name="size"
                value={data.size}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Price per month</label>
              <input
                type="number"
                name="price"
                value={data.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Previous
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};