import React from 'react'
import Layout from '../components/Layout/Layout'
import { useQuery } from '@tanstack/react-query'
import { reportsService } from '../services/reportsService'
import ReportsTable from '../components/Reports/ReportsTable'
import { Button } from '../components/ui/button'
import { exportToCsv } from '../utils/reportUtils'

const PendingItems = () => {

  const { data, isLoading, refetch, error } = useQuery({

    queryKey: ['pending-items'],
    queryFn: () => reportsService.getPendingItems(),
  })

  const handleExport = () => {
    console.log('Exporting...')
    exportToCsv(data.data.pending_items, 'pending-items.csv')
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }
  return (
    <Layout
      title="Pending Indent Items"
      subtitle="View and manage pending indent items"
    >
        <Button onClick={handleExport}>Export</Button>
      <ReportsTable data={data.data.pending_items} title="Pending Items"
       summaryCols={[]} />
    </Layout>
  )
}

export default PendingItems