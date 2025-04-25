import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClientList from './ClientList.jsx';
import FactureList from './FactureList';
import AddClientForm from './AddClientForm';
import ModifierFactureForm from './ModifierFactureForm'; 

const App = () => {
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [factureToEdit, setFactureToEdit] = useState(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  const fetchClients = () => {
    axios.get('http://localhost/gestion_clients_php/getClients.php')
      .then(response => {
        if (response.data.success && Array.isArray(response.data.clients)) {
          setClients(response.data.clients);
        } else {
          console.error('Format de réponse invalide:', response.data);
          setClients([]);
        }
      })
      .catch(error => {
        console.error(error);
        setClients([]);
      });
  };

  const fetchFactures = (clientId) => {
    axios.get(`http://localhost/gestion_clients_php/getFactures.php?client_id=${clientId}`)
      .then(response => setFactures(response.data))
      .catch(error => console.error(error));
  };  

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId);
    fetchFactures(clientId);
  };

  const handleClientUpdated = () => {
    fetchClients();
    if (selectedClient) {
      fetchFactures(selectedClient); 
    }
    setShowAddClientForm(false);
  };

  const handleFactureUpdated = () => {
    if (selectedClient) fetchFactures(selectedClient);
  };

  const handleDeleteClient = (id) => {
    axios.delete(`http://localhost/gestion_clients_php/supprimerClient.php?id=${id}`)
      .then(response => {
        console.log(response.data);
        fetchClients(); 
      })
      .catch(error => {
        console.error("Erreur lors de la suppression:", error);
      });
  };

  const handleEditFacture = (facture) => {
    setFactureToEdit(facture); 
  };

  const handleCancelEditFacture = () => {
    setFactureToEdit(null); 
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des clients et factures</h1>
      
      <div className="space-y-8">
          <ClientList
            clients={clients}
            onSelectClient={handleClientSelect}
            onClientUpdated={handleClientUpdated}
            onDeleteClient={handleDeleteClient}
            onAddClient={() => setShowAddClientForm(true)}
          />

          {showAddClientForm && (
            <div className="mt-4">
              <AddClientForm 
                onClientAdded={handleClientUpdated} 
                onCancel={() => setShowAddClientForm(false)}
              />
            </div>
          )}

        {selectedClient && !factureToEdit && clients.length > 0 && (
            <FactureList
              factures={factures}
              onFactureUpdated={handleFactureUpdated}
              onEditFacture={handleEditFacture} 
              clientId={selectedClient}
            />
        )}

        {factureToEdit && (
          <div className="mt-4">
            <ModifierFactureForm
              facture={factureToEdit}
              onFactureUpdated={() => {
                handleFactureUpdated();
                setFactureToEdit(null);
              }}
              onCancel={handleCancelEditFacture}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

