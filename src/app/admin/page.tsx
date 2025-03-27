import Settings from "@/components/Settings/Settings";
import AdminTable from "@/components/Table/AdminTable";
import classes from './page.module.css';
import { logout } from '@/lib/login';
import { Button } from "@mantine/core";

export default async function Admin() {
  return (
    <>
      <Settings />
      <AdminTable />
      <Button variant="subtle" className={classes.logout} onClick={logout}>Logout</Button>
    </>
  )
}