import FormComponent from "../components/Form";
import { Container } from 'react-bootstrap';

function Register() {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <FormComponent route="/hood_hockey_app/user/register/" method="register" />
        </Container>
    );
}

export default Register;