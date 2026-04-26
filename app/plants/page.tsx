'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Droplets, Leaf, Trash2, Edit, Calendar, Heart, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Plant {
  id: string;
  plantName: string;
  plantType: string;
  plantingDate: string;
  expectedHarvest: string;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  notes: string;
  lastWatered: string;
  lastFertilized: string;
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPlant, setNewPlant] = useState({
    plantName: '',
    plantType: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvest: '',
    notes: '',
  });

  const fetchPlants = async () => {
    try {
      // Token is sent via cookies automatically
      const res = await axios.get('http://localhost:5000/api/v1/plants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlants(res.data.data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Token is sent via cookies automatically
      await axios.post('http://localhost:5000/api/v1/plants', newPlant, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewPlant({
        plantName: '',
        plantType: '',
        plantingDate: new Date().toISOString().split('T')[0],
        expectedHarvest: '',
        notes: '',
      });
      fetchPlants();
    } catch (error) {
      console.error('Error creating plant:', error);
    }
  };

  const handleWater = async (id: string) => {
    try {
      // Token is sent via cookies automatically
      await axios.patch(`http://localhost:5000/api/v1/plants/${id}/water`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlants();
    } catch (error) {
      console.error('Error watering plant:', error);
    }
  };

  const handleFertilize = async (id: string) => {
    try {
      // Token is sent via cookies automatically
      await axios.patch(`http://localhost:5000/api/v1/plants/${id}/fertilize`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlants();
    } catch (error) {
      console.error('Error fertilizing plant:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 bg-green-100';
      case 'GOOD': return 'text-green-500 bg-green-50';
      case 'FAIR': return 'text-yellow-600 bg-yellow-100';
      case 'POOR': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return <CheckCircle className="w-4 h-4" />;
      case 'GOOD': return <Heart className="w-4 h-4" />;
      case 'FAIR': return <AlertCircle className="w-4 h-4" />;
      case 'POOR': return <AlertCircle className="w-4 h-4" />;
      case 'CRITICAL': return <AlertCircle className="w-4 h-4" />;
      default: return <Leaf className="w-4 h-4" />;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Plants</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Plant
        </button>
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Leaf className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No plants tracked yet</h3>
          <p className="text-gray-500">Start tracking your garden plants today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{plant.plantName}</h3>
                  <p className="text-gray-500 text-sm">{plant.plantType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getHealthColor(plant.healthStatus)}`}>
                  {getHealthIcon(plant.healthStatus)}
                  {plant.healthStatus}
                </span>
              </div>

                 <div className="space-y-2 text-sm text-gray-600">
                 <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   <span suppressHydrationWarning>Planted: {new Date(plant.plantingDate).toLocaleDateString()}</span>
                 </div>
                 {plant.expectedHarvest && (
                   <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4" />
                     <span suppressHydrationWarning>Harvest: {new Date(plant.expectedHarvest).toLocaleDateString()}</span>
                   </div>
                 )}
                 {plant.lastWatered && (
                   <div className="flex items-center gap-2">
                     <Droplets className="w-4 h-4 text-blue-500" />
                     <span suppressHydrationWarning>Last watered: {new Date(plant.lastWatered).toLocaleDateString()}</span>
                   </div>
                 )}
                 {plant.lastFertilized && (
                   <div className="flex items-center gap-2">
                     <Leaf className="w-4 h-4 text-green-500" />
                     <span suppressHydrationWarning>Last fertilized: {new Date(plant.lastFertilized).toLocaleDateString()}</span>
                   </div>
                 )}
               </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleWater(plant.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  <Droplets className="w-4 h-4" />
                  Water
                </button>
                <button
                  onClick={() => handleFertilize(plant.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                >
                  <Leaf className="w-4 h-4" />
                  Fertilize
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add New Plant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name</label>
                <input
                  type="text"
                  value={newPlant.plantName}
                  onChange={(e) => setNewPlant({ ...newPlant, plantName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plant Type</label>
                <input
                  type="text"
                  value={newPlant.plantType}
                  onChange={(e) => setNewPlant({ ...newPlant, plantType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                <input
                  type="date"
                  value={newPlant.plantingDate}
                  onChange={(e) => setNewPlant({ ...newPlant, plantingDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
                <input
                  type="date"
                  value={newPlant.expectedHarvest}
                  onChange={(e) => setNewPlant({ ...newPlant, expectedHarvest: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newPlant.notes}
                  onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Plant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
