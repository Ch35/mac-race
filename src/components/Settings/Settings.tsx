'use client';

import { RefObject, useState } from "react";
import { Button, SimpleGrid, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from './Settings.module.css';
import { Eye, EyeOff, PlusSquare, Settings as SettingsIcon } from 'react-feather';
import AddBoat from "./AddBoat";
import { RaceWithStart } from "../Table/hooks";
import EditFlags from "./EditFlags";
import * as XLSX from "xlsx";

type Props = {
  loading: boolean,
  races: RaceWithStart[],
  tableRef: RefObject<HTMLTableElement | null>,
};

export default function Settings({ loading, races, tableRef }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState('');

  const toggleHidden = () => {
    setHidden(!hidden);
  }

  const openSetting = (setting: string) => {
    open();
    switch (setting) {
      case 'addBoat':
        setModal(<AddBoat />);
        return setModalTitle('Add Boat');
      case 'flags':
        setModal(<EditFlags races={races} close={close} />);
        return setModalTitle('Edit flags');
      default:
        setModal(null);
        return setModalTitle('');
    }
  }

  const exportData = () => {
    if (!tableRef.current) return console.error('Missing table ref', tableRef.current);

    // Convert the table to a worksheet
    const worksheet = XLSX.utils.table_to_sheet(tableRef.current);

    if (!worksheet["!ref"]) {
      console.error('Worksheet reference is undefined');
      return;
    }
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Reduce column range to exclude the last two columns
    if (range.e.c >= 2) {
      range.e.c -= 2;
      worksheet["!ref"] = XLSX.utils.encode_range(range);
    }
    
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, 'mac_results.xlsx');
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={modalTitle}
        size="xl"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        {modal}
      </Modal>

      <div className={classes.container} hidden={hidden}>
        {loading ? (
          <div className={classes.loading}>
            <div className={classes.loadingText}>Loading...</div>
          </div>
        ) : (
          <SimpleGrid cols={8} spacing={10} style={{ marginTop: 10 }}>
            <Button variant="outline" onClick={() => openSetting('addBoat')}><PlusSquare style={{ marginRight: '5px' }} /> Add Boat</Button>
            <Button onClick={() => openSetting('flags')}><SettingsIcon style={{ marginRight: '5px' }} /> Flags</Button>
            <div></div>
            <div></div>
            <Button variant="outline" onClick={exportData}>Export</Button>
          </SimpleGrid>
        )}
      </div>

      <div className={classes.hideSettingsContainer} style={{ float: 'left' }}>
        {
          hidden
            ? <EyeOff className={classes.hideSettingsBtn} onClick={toggleHidden} />
            : <Eye className={classes.hideSettingsBtn} onClick={toggleHidden} />
        }
      </div>
    </>
  );
}