/** @format */

const Modal = ({ onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto h-full w-full z-999"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">{children}</div>
        <div className="mt-4"></div>
      </div>
    </div>
  );
};

export default Modal;
