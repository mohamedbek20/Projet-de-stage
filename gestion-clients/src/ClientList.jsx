import React, { useState, useMemo } from 'react';
import AddClientForm from './AddClientForm';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ReactCountryFlag from 'react-country-flag';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { getCountryCode } from './countryUtils';
import axios from 'axios';

const ClientList = ({ clients = [], onSelectClient, onClientUpdated, onDeleteClient, onAddClient }) => {
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, clientId: null });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    pays: ''
  });

  const countries = useMemo(() => {
    return countryList()
      .getData()
      .filter(country => country.value !== 'IL')
      .map(country => ({
        value: country.value,
        label: (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={country.value}
              svg
              style={{
                width: '1.5em',
                height: '1.5em',
                marginRight: '8px'
              }}
            />
            {country.label}
          </div>
        ),
        searchLabel: country.label
      }));
  }, []);

  if (!Array.isArray(clients)) {
    console.error('clients n\'est pas un tableau:', clients);
    return <div>Erreur de chargement des clients</div>;
  }

  // Calcul de la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (client, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingClient(client.id);
    const newFormData = {
      id: client.id,
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      pays: client.pays
    };
    setFormData(newFormData);
    setOriginalFormData(newFormData);
    setHasChanges(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Vérifier s'il y a des changements par rapport aux données originales
    const hasAnyChange = Object.keys(newFormData).some(key => 
      newFormData[key] !== originalFormData[key]
    );
    setHasChanges(hasAnyChange);
  };

  const handleCountryChange = (selectedOption) => {
    const newFormData = {
      ...formData,
      pays: selectedOption ? selectedOption.value : ''
    };
    setFormData(newFormData);
    
    // Vérifier s'il y a des changements par rapport aux données originales
    const hasAnyChange = Object.keys(newFormData).some(key => 
      newFormData[key] !== originalFormData[key]
    );
    setHasChanges(hasAnyChange);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.id) {
      console.error('ID du client manquant');
      return;
    }

    try {
      const response = await fetch('http://localhost/projet_stage/gestion_clients_php/modifierClient.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onClientUpdated();
        setEditingClient(null);
      } else {
        throw new Error(data.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingClient(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      pays: ''
    });
    setOriginalFormData(null);
    setHasChanges(false);
  };

  const handleShowInvoices = (clientId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedClientId === clientId) {
      setSelectedClientId(null);
      onSelectClient(null);
    } else {
      setSelectedClientId(clientId);
      onSelectClient(clientId);
    }
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setDeleteConfirmation({ show: true, clientId: id });
  };

  const handleConfirmDelete = () => {
    const id = deleteConfirmation.clientId;
    axios.delete(`http://localhost/projet_stage/gestion_clients_php/supprimerClient.php?id=${id}`)
      .then(response => {
        if (response.data.success) {
          if (selectedClientId === id) {
            setSelectedClientId(null);
            onSelectClient(null);
          }
          onDeleteClient(id);
        } else {
          setError(response.data.message || 'Erreur lors de la suppression');
        }
      })
      .catch(error => {
        console.error(error);
        setError('Erreur lors de la suppression du client');
      })
      .finally(() => {
        setDeleteConfirmation({ show: false, clientId: null });
      });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, clientId: null });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="w-full">
          <div className="shadow-md sm:rounded-lg">
            <table className="min-w-full text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center">Nom</th>
                  <th scope="col" className="px-6 py-3 text-center">Prénom</th>
                  <th scope="col" className="px-6 py-3 text-center">Email</th>
                  <th scope="col" className="px-6 py-3 text-center">Pays</th>
                  <th scope="col" className="px-6 py-3 text-center">Téléphone</th>
                  <th scope="col" className="px-6 py-3 text-center">Adresse</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(true)} 
                      className="btn-add"
                    >
                      Ajouter
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  currentItems.map(client => (
                    <tr 
                      key={client.id} 
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      {editingClient === client.id ? (
                        <>
                          <td className="px-6 py-4 text-center w-1/6">
                            <input
                              type="text"
                              name="nom"
                              value={formData.nom}
                              onChange={handleFormChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-1 w-full"
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <input
                              type="text"
                              name="prenom"
                              value={formData.prenom}
                              onChange={handleFormChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-1 w-full"
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleFormChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-1 w-full"
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <Select
                              options={countries}
                              value={countries.find(country => country.value === formData.pays)}
                              onChange={handleCountryChange}
                              className="country-select"
                              classNamePrefix="country-select"
                              placeholder="Sélectionnez un pays"
                              isClearable
                              isSearchable
                              getOptionLabel={option => option.searchLabel}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <input
                              type="tel"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleFormChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-1 w-full"
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <input
                              type="text"
                              name="adresse"
                              value={formData.adresse}
                              onChange={handleFormChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-1 w-full"
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <div className="flex justify-center space-x-2">
                              {hasChanges && (
                                <button
                                  type="button"
                                  onClick={handleEditFormSubmit}
                                  className="btn-modify"
                                >
                                  Sauvegarder
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn-delete"
                              >
                                Annuler
                              </button>
                            </div>
                          </td>
                          <td></td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-center w-1/6">{client.nom}</td>
                          <td className="px-6 py-4 text-center w-1/6">{client.prenom}</td>
                          <td className="px-6 py-4 text-center w-1/6">{client.email}</td>
                          <td className="px-6 py-4 text-center w-1/6">
                            {client.pays && (
                              <div className="flex items-center justify-center">
                                <ReactCountryFlag
                                  countryCode={getCountryCode(client.pays)}
                                  svg
                                  style={{
                                    width: '1.5em',
                                    height: '1.5em',
                                    marginRight: '8px'
                                  }}
                                />
                                {client.pays}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center w-1/6">{client.telephone}</td>
                          <td className="px-6 py-4 text-center w-1/6">{client.adresse}</td>
                          <td className="px-6 py-4 text-center w-1/6">
                            <div className="flex justify-center space-x-2">
                              <button 
                                type="button"
                                onClick={(e) => handleEditClick(client, e)}
                                className="btn-modify"
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteClick(client.id, e)}
                                className="btn-delete"
                              >
                                Supprimer
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleShowInvoices(client.id, e)}
                                className={selectedClientId === client.id ? 
                                  "text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-3 py-1.5 text-center" :
                                  "text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 shadow-lg shadow-lime-500/50 dark:shadow-lg dark:shadow-lime-800/80 font-medium rounded-lg text-sm px-3 py-1.5 text-center"
                                }
                              >
                                {selectedClientId === client.id ? 'Masquer' : 'Factures'}
                              </button>
                            </div>
                          </td>
                          <td></td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {clients.length > itemsPerPage && (
          <Stack spacing={2} alignItems="center" className="mt-4">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => handlePageChange(value)}
              color="primary"
              shape="rounded"
              size="large"
            />
          </Stack>
        )}

        {/* Modal pour le formulaire d'ajout */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ajouter un nouveau client</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddClientForm 
                onClientAdded={() => {
                  onClientUpdated();
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {deleteConfirmation.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirmation de suppression</h3>
              <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce client ?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="btn-modify"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn-delete"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
