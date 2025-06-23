import { useState, useCallback } from 'react';

type UseModalHook = {
  isVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
};

const useModal = (): UseModalHook => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const openModal = useCallback((): void => {
    setIsVisible(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsVisible(false);
  }, []);

  const toggleModal = useCallback((): void => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default useModal;
