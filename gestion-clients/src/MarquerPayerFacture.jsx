import React from 'react';
import axios from 'axios';

const MarquerPayerFacture = ({ factureId, onFactureUpdated }) => {
  const handleMarquerPayer = (e) => {
    e.preventDefault();
    
    axios.post('http://localhost/projet_stage/gestion_clients_php/marquerPayerFacture.php', {
      id: factureId,
    })
    .then((response) => {
      console.log('Réponse serveur:', response.data);
      if (response.data.success) {
        onFactureUpdated(factureId, 'payée');
      }
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour du statut:', error);
    });
  };

  return (
    <button 
      type="button"
      onClick={handleMarquerPayer}
      className="btn-save"
    >
      Régler
    </button>
  );
};

export default MarquerPayerFacture;
