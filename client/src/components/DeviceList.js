import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { Row } from "react-bootstrap";
import DeviceItem from "./DeviceItem";

const DeviceList = observer(() => {
    const { device } = useContext(Context);
    const devices = Array.isArray(device.devices) ? device.devices : [];

    return (
        <Row className="d-flex">
            {devices.length === 0 ? (
                <div>Нет устройств</div>
            ) : (
                devices.map(device => (
                    <DeviceItem key={device.id} device={device} />
                ))
            )}
        </Row>
    );
});

export default DeviceList;