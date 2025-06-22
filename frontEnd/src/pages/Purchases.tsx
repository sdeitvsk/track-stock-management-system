import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Calendar } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { inventoryService, Purchase } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../components/ui/pagination';
import NewPurchaseForm from '../components/forms/NewPurchaseForm';

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPurchaseForm, setShowNewPurchaseForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, searchTerm]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const filters = searchTerm ? { item_name: searchTerm } : {};
      const response = await inventoryService.getPurchases(currentPage, 10, filters);
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        // The API returns purchases in data.purchases, not data.items
        setPurchases(response.data.purchases || []);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error: any) {
      console.error('Failed to fetch purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchases',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleNewPurchaseSuccess = () => {
    setShowNewPurchaseForm(false);
    fetchPurchases();
  };

  return (
    <Layout title="Purchases" subtitle="Manage purchase transactions">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <Button onClick={() => setShowNewPurchaseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : !purchases || purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingCart className="w-4 h-4 text-slate-400 mr-3" />
                          <div className="font-medium text-slate-900">{purchase.item_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {purchase.transaction.member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {purchase.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        ${parseFloat(purchase.rate).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        ${(purchase.quantity * parseFloat(purchase.rate)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                        {purchase.remaining_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(purchase.purchase_date)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* New Purchase Form Modal */}
      {showNewPurchaseForm && (
        <NewPurchaseForm
          onClose={() => setShowNewPurchaseForm(false)}
          onSuccess={handleNewPurchaseSuccess}
        />
      )}
    </Layout>
  );
};

export default Purchases;
