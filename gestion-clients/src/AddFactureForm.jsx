import React, { useState } from 'react';
import axios from 'axios';

const AddFactureForm = ({ clientId, onFactureAdded, onCancel }) => {
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [dateFacture, setDateFacture] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const factureData = {
      client_id: clientId,
      description: description.trim(),
      montant: parseFloat(montant),
      date_facture: dateFacture
    };
    
    console.log("Données envoyées:", factureData);
    
    axios.post(
      'http://localhost/gestion_clients_php/addFacture.php',
      JSON.stringify(factureData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(response => {
        console.log("Réponse du serveur:", response.data);
        onFactureAdded();
        setDescription('');
        setMontant('');
        setDateFacture('');
      })
      .catch(error => {
        console.error("Erreur lors de l'ajout de la facture:", error.response ? error.response.data : error);
      });
  };

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="px-6 py-3 bg-gray-50 border-b">
        <h3 className="text-xs font-semibold text-gray-700 uppercase">Ajouter une facture</h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                type="text" 
                placeholder="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="input w-full"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DH)</label>
              <input 
                type="number" 
                step="1" 
                placeholder="Montant" 
                value={montant} 
                onChange={(e) => setMontant(e.target.value)} 
                className="input w-full"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={dateFacture} 
                onChange={(e) => setDateFacture(e.target.value)} 
                className="input w-full"
                required 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button 
              type="submit" 
                    className="btn-add"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFactureForm;
