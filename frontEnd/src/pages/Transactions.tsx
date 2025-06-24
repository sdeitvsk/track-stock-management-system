
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import TransactionFilters from '../components/Transactions/TransactionFilters';
import TransactionActions from '../components/Transactions/TransactionActions';
import TransactionTable from '../components/Transactions/TransactionTable';
import { inventoryService, Transaction, Member } from '../services/inventoryService';
import { useToast } from '../hooks/use-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, typeFilter, memberFilter, startDate, endDate]);

  const fetchMembers = async () => {
    try {
      const response = await inventoryService.getMembers({ limit: 100 });
      if (response.success && response.data) {
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchTerm) filters.invoice_no = searchTerm;
      if (typeFilter) filters.type = typeFilter;
      if (memberFilter) filters.member_id = memberFilter;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      
      const response = await inventoryService.getTransactions(currentPage, 10, filters);
      
      if (response.success && response.data) {
        // Handle both 'transactions' and 'rows' response formats
        const transactionData = response.data.transactions || response.data.rows || [];
        setTransactions(transactionData);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setMemberFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleAddPurchase = () => {
    navigate('/purchase-entry');
  };

  const handleAddIssue = () => {
    navigate('/issue-entry');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (transaction.type === 'purchase') {
      navigate(`/purchase-entry?edit=${transaction.id}`);
    } else if (transaction.type === 'issue') {
      navigate(`/issue-entry?edit=${transaction.id}`);
    } else {
      toast({
        title: 'Info',
        description: 'This transaction type cannot be edited',
        variant: 'default'
      });
    }
  };

  return (
    <Layout title="Transactions" subtitle="View all purchase and issue transactions">
      <div className="space-y-6">
        <TransactionActions 
          onAddPurchase={handleAddPurchase}
          onAddIssue={handleAddIssue}
        />

        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          memberFilter={memberFilter}
          onMemberFilterChange={setMemberFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          members={members}
          onClearFilters={clearFilters}
        />

        <TransactionTable
          transactions={transactions}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEditTransaction={handleEditTransaction}
        />
      </div>
    </Layout>
  );
};

export default Transactions;
