// Plan picker disabled - all features free
import React from 'react';
import { observer } from 'mobx-react-lite';

import { styled } from '../../styles';
import { Icon } from '../../icons';

const Modal = styled.dialog`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    margin: 0;
    border: none;
    background: transparent;
`;

const ModalContent = styled.div`
    background: ${p => p.theme.containerBackground};
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    text-align: center;
`;

const Title = styled.h2`
    margin: 0 0 20px 0;
    color: ${p => p.theme.mainColor};
`;

const Message = styled.p`
    margin: 0 0 30px 0;
    color: ${p => p.theme.mainColor};
`;

const PlanPickerDisabled = observer(() => {
    return (
        <Modal open>
            <ModalContent>
                <Icon icon={['fas', 'star']} size="4x" />
                <Title>All Features Free</Title>
                <Message>
                    All HTTP Toolkit Pro features are now available for free. No subscription required.
                </Message>
            </ModalContent>
        </Modal>
    );
});

export { PlanPickerDisabled as PlanPicker };
