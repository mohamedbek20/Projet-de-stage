import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { countries } from './countries';
import { getCountryName } from './countryUtils';

const AddClientForm = ({ onClientAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    pays: ''
  });
  const [error, setError] = useState(null);

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: state.isSelected ? '#0284c7' : state.isFocused ? '#e0f2fe' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer'
    }),
    control: (provided) => ({
      ...provided,
      padding: '2px'
    })
  };

  const formatOptionLabel = ({ value, label }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <ReactCountryFlag
        countryCode={value}
        svg
        style={{
          width: '1.5em',
          height: '1.5em',
          marginRight: '8px'
        }}
      />
      <span>{label}</span>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setFormData(prevState => ({
      ...prevState,
      pays: selectedOption ? getCountryName(selectedOption.value) : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    console.log('Envoi des données:', formData);

    axios.post('http://localhost/gestion_clients_php/addClient.php', formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Réponse complète du serveur:', response);
      console.log('Données de réponse:', response.data);
      
      if (response.data.success) {
        console.log('Client ajouté avec succès');
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          adresse: '',
          pays: ''
        });
        if (onClientAdded) {
          onClientAdded();
        }
      } else {
        console.error('Erreur serveur:', response.data.message);
        setError(response.data.message || 'Erreur lors de l\'ajout du client');
      }
    })
    .catch(error => {
      console.error('Erreur détaillée:', error);
      if (error.response) {
        console.error('Données d\'erreur:', error.response.data);
        console.error('Status:', error.response.status);
        setError(error.response.data.message || 'Erreur lors de l\'ajout du client');
      } else if (error.request) {
        console.error('Pas de réponse reçue');
        setError('Erreur de connexion au serveur');
      } else {
        console.error('Erreur de configuration:', error.message);
        setError('Erreur lors de la requête');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-red-500 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
            className="input w-full"
          required
        />
      </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
        <input
          type="text"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
            className="input w-full"
          required
        />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pays
        </label>
        <Select
          options={countries}
          value={countries.find(country => country.value === formData.pays)}
          onChange={handleCountryChange}
          className="country-select"
          classNamePrefix="country-select"
          placeholder="Sélectionnez un pays"
          isClearable
          isSearchable
          formatOptionLabel={formatOptionLabel}
          styles={customStyles}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse
        </label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn-delete"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="btn-add"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;