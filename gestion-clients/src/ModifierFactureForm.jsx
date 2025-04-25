import React, { useState } from 'react';
import axios from 'axios';

const ModifierFactureForm = ({ facture, onFactureUpdated }) => {
  const [formData, setFormData] = useState({ ...facture });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSend = {
      id: formData.id,
      description: formData.description,
      montant: formData.montant,
      status: formData.status || 'non réglée'
    };

    console.log("Données envoyées:", dataToSend);

    axios.post('http://localhost/projet_stage/gestion_clients_php/modifierFacture.php', dataToSend)
    .then(response => {
      console.log('Réponse serveur:', response.data);

      if (response.data.success) {
        setSuccess('Facture modifiée avec succès');
        setError(null);
        if (typeof onFactureUpdated === 'function') {
          onFactureUpdated();
        }
      } else {
        setError(response.data.message || 'Erreur lors de la modification de la facture');
        setSuccess(null);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la modification:', error);
      setError('Erreur lors de la modification de la facture');
      setSuccess(null);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <div className="text-green-500">{success}</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block">Description:</label>
        <input
          type="text"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block">Montant:</label>
        <input
          type="number"
          name="montant"
          value={formData.montant || ''}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block">Date de facture:</label>
        <input
          type="date"
          name="date_facture"
          value={formData.date_facture || ''}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block">Statut:</label>
        <select
          name="status"
          value={formData.status || 'non réglée'}
          onChange={handleChange}
          className="input"
        >
          <option value="non réglée">Non réglée</option>
          <option value="payée">Payée</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >
        Enregistrer les modifications
      </button>
    </form>
  );
};

export default ModifierFactureForm;