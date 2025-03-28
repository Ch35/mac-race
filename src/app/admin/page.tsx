'use client'

import Settings from "@/components/Settings/Settings";
import AdminTable from "@/components/Table/AdminTable";
import classes from './page.module.css';
import { logout } from '@/lib/login';
import { Alert, Button } from "@mantine/core";
import { useError, useTable } from "@/components/Table/hooks";
import { AlertCircle } from "react-feather";
import { useRef } from "react";

export default function Admin() {
  const { data, loading, races } = useTable();
  const { error, setError, errorCount } = useError();
  const tableRef = useRef(null);

  return (
    <>
      {error && (
        <Alert className={classes.errorAlert} color="red" variant="filled" icon={<AlertCircle />}>
          {error} {errorCount > 1 && `(x${errorCount})`}
        </Alert>
      )}
      <Settings
        loading={loading}
        races={races}
        setError={setError}
        tableRef={tableRef}
      />
      <AdminTable
        races={races}
        data={data}
        loading={loading}
        setError={setError}
        tableRef={tableRef}
      />
      <Button variant="subtle" className={classes.logout} onClick={logout}>Logout</Button>
    </>
  )
}