import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';

export const StyledContainer = styled(ToastContainer)`
.Toastify__toast--error {
    border: 1px solid #212226;
    border-radius: 10px !important;
    background: #212226 !important;
}
.Toastify__toast--success {
  border-radius: 10px !important;
  background: #212226 !important;
}
.Toastify__toast--warning {
    background: #212226 !important;
}
.Toastify__toast--info {
    background: #212226 !important;
    border-radius: 10px !important;
}
.Toastify__toast-body {
    font-family: "Atlas Grotesk Web", Arial, Helvetica, sans-serif;
    color: #fff;
    font-size: 1rem !important;
    font-weight: 600;
}
.Toastify__progress-bar {
    background: #CFB97F;
}
`;
