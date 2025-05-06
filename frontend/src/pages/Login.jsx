import FormComponent from "../components/Form";
import { Container } from 'react-bootstrap';
import { useContext } from 'react'; // Import useContext
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function Login() {
    const { login } = useContext(AuthContext); // Consume login function from AuthContext

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <FormComponent route="/hood_hockey_app/token/" method="login" onLogin={login} /> {/* Pass login to FormComponent as onLogin */}
        </Container>
    );
}

export default Login;