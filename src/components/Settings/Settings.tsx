'use client';

import { useState } from "react";
import { Button, SimpleGrid, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from './Settings.module.css';
import { Eye, EyeOff, PlusSquare, Settings as SettingsIcon } from 'react-feather';
import AddBoat from "./AddBoat";

export default function Settings() {
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
        setModal(<>Flag</>);
        return setModalTitle('Edit flags');
      default:
        setModal(null);
        return setModalTitle('');
    }
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
        <SimpleGrid cols={8} spacing={10} style={{ marginTop: 10 }}>
          <Button variant="outline" onClick={() => openSetting('addBoat')}><PlusSquare style={{ marginRight: '5px' }} /> Add Boat</Button>
          <Button onClick={() => openSetting('flags')}><SettingsIcon style={{ marginRight: '5px' }} /> Flags</Button>
        </SimpleGrid>
      </div>

      <div style={{ float: 'left' }}>
        {hidden ? <EyeOff onClick={toggleHidden} /> : <Eye onClick={toggleHidden} />}
      </div>
    </>
  );
}