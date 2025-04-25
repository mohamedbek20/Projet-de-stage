import React, { useState } from 'react';
import axios from 'axios';
import MarquerPayerFacture from './MarquerPayerFacture';
import AddFactureForm from './AddFactureForm';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const FactureList = ({ factures, onFactureUpdated, clientId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFacture, setEditingFacture] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, factureId: null });
  const itemsPerPage = 5;
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    montant: '',
    status: ''
  });
  
  if (!Array.isArray(factures)) {
    return <div>Aucune facture trouvée ou une erreur est survenue.</div>;
  }

  // Calcul de la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = factures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(factures.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteClick = (factureId, e) => {
    e.preventDefault();
    setDeleteConfirmation({ show: true, factureId });
  };

  const handleConfirmDelete = () => {
    const factureId = deleteConfirmation.factureId;
    axios.get(`http://localhost/projet_stage/gestion_clients_php/supprimerFacture.php?id=${factureId}`)
      .then(() => {
        onFactureUpdated();
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression de la facture:", error);
      })
      .finally(() => {
        setDeleteConfirmation({ show: false, factureId: null });
      });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, factureId: null });
  };

  const handleFactureUpdated = (factureId, newStatus) => {
    const updatedFactures = factures.map(facture => {
      if (facture.id === factureId) {
        return { ...facture, status: newStatus };
      }
      return facture;
    });
    onFactureUpdated(updatedFactures);
  };

  const handleEditClick = (facture) => {
    setEditingFacture(facture.id);
    const newFormData = {
      description: facture.description,
      montant: facture.montant,
      status: facture.status
    };
    setFormData(newFormData);
    setOriginalFormData(newFormData);
    setHasChanges(false);
  };

  const handleCancelEdit = () => {
    setEditingFacture(null);
    setFormData({
      description: '',
      montant: '',
      status: ''
    });
    setOriginalFormData(null);
    setHasChanges(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Vérifier s'il y a des changements par rapport aux données originales
    const hasAnyChange = Object.keys(newFormData).some(key => 
      String(newFormData[key]) !== String(originalFormData[key])
    );
    setHasChanges(hasAnyChange);
  };

  const handleEditSubmit = async (id) => {
    try {
      const dataToSend = {
        id: id,
        description: formData.description,
        montant: formData.montant,
        status: formData.status
      };

      await axios.post('http://localhost/projet_stage/gestion_clients_php/modifierFacture.php', dataToSend);
      setEditingFacture(null);
      setFormData({
        description: '',
        montant: '',
        status: ''
      });
      setOriginalFormData(null);
      setHasChanges(false);
      onFactureUpdated();
    } catch (error) {
      console.error('Erreur lors de la modification de la facture:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">

        <div className={`transition-all duration-300 ease-in-out ${showAddForm ? 'w-2/3' : 'w-full'}`}>
          <div className="shadow-md sm:rounded-lg">
            <table className="min-w-full text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center">Description</th>
                  <th scope="col" className="px-6 py-3 text-center">Montant</th>
                  <th scope="col" className="px-6 py-3 text-center">Date</th>
                  <th scope="col" className="px-6 py-3 text-center">Statut</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={showAddForm ? 'btn-delete' : 'btn-add'}
                    >
                      {showAddForm ? 'Annuler' : 'Ajouter'}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factures.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  currentItems.map(facture => (
                    <tr key={facture.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">
                        {editingFacture === facture.id ? (
                          <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleEditFormChange}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          facture.description
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingFacture === facture.id ? (
                          <input
                            type="number"
                            name="montant"
                            value={formData.montant}
                            onChange={handleEditFormChange}
                            className="w-full p-2 border rounded"
                            step="0.01"
                          />
                        ) : (
                          `${facture.montant} DH`
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {new Date(facture.date_creation).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingFacture === facture.id ? (
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleEditFormChange}
                            className="w-full p-2 border rounded"
                          >
                            <option value="non réglée">Non réglée</option>
                            <option value="payée">Payée</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            facture.status === 'payée' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {facture.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          {facture.status !== 'payée' && !editingFacture && (
                            <MarquerPayerFacture 
                              factureId={facture.id} 
                              onFactureUpdated={handleFactureUpdated}
                            />
                          )}
                          {editingFacture === facture.id ? (
                            <>
                              {hasChanges && (
                                <button
                                  onClick={() => handleEditSubmit(facture.id)}
                                  className="btn-add"
                                >
                                  Sauvegarder
                                </button>
                              )}
                              <button
                                onClick={handleCancelEdit}
                                className="btn-delete"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleEditClick(facture)}
                                className="btn-modify"
                              >
                                Modifier
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(facture.id, e)}
                                className="btn-delete"
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {factures.length > itemsPerPage && (
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

          {/* Modal de confirmation de suppression */}
          {deleteConfirmation.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Confirmation de suppression</h3>
                <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette facture ?</p>
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

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="w-1/3">
            <AddFactureForm 
              clientId={clientId}
              onFactureAdded={() => {
                onFactureUpdated();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FactureList;
