import { useState, useEffect } from "react";
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    FormControl,
    Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
import FbLogin from "./loginwithfb";
import FacebookIcon from '../icons/FacebookIcon';
import "../assets/css/Login.css";

const Login = (props) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [wrong, setWrong] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line no-undef
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            console.log(window.location);
        });
        axios.get(`http://localhost:5000/api/user/find/?userId=${localStorage.getItem('userId')}&loginWithFB=${localStorage.getItem('loginWithFB')}`, {
            headers: {
                'Access-Control-Allow-Origin': true,
                'x-access-token': localStorage.getItem('token')
            }
        }).then((res) => {
            console.log(res.data);
            navigate('/main', { replace: true });
        }).catch((err) => { console.log(err); console.log('User not logged in'); });
    }, []);

    const componentClicked = () => { };

    const responseFacebook = (fbRes) => {
        console.log(fbRes);
        // eslint-disable-next-line no-undef
        FB.getLoginStatus((response) => {
            if (response.status === 'connected') {
                console.log(response);

                axios.post('http://localhost:5000/api/users/facebook-login', {
                    firstName: fbRes.name.split(' ')[0],
                    lastName: fbRes.name.split(' ')[1],
                    email: fbRes.email,
                }, {
                    headers: {
                        'Access-Control-Allow-Origin': true,
                    }
                })
                    .then((res) => {
                        console.log(res.data);
                        localStorage.setItem('userId', res.data.userId);
                        localStorage.setItem('loginWithFB', true);
                        localStorage.setItem('token', fbRes.accessToken);
                        navigate('/main', { replace: true });
                    })
                    .catch((err) => { console.log(err); });
            }
        });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/users/login', {
            email: email,
            password: password
        }, {
            headers: {
                'Access-Control-Allow-Origin': true,
            }
        })
            .then((res) => {
                console.log(res.data);
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('loginWithFB', false);
                localStorage.setItem('token', res.data.accessToken);
                navigate('/main', { replace: true });
            })
            .catch((err) => {
                if (err.response.status === 404) { setWrong(true); console.log(err.response.data.emailnotfound); }
                if (err.response.status === 400) { if (err.response.data.passwordincorrect) { setWrong(true); console.log(err.response.data.passwordincorrect); } else { console.log(err.response.data); } }
            });
    }

    return (
        <>
            <Container>
                <Row>
                    <Col>
                        <p
                            style={{
                                margin: '10px 0 0',
                                textAlign: 'center',
                                color: '#172b4d',
                                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                                fontWeight: 500,
                                fontSize: '29px'
                            }}
                        >
                            Sign in
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p
                            style={{
                                margin: '0',
                                textAlign: 'center',
                                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                                fontWeight: 400,
                                fontSize: '0.875rem',
                                color: '#6b778c'
                            }}
                        >
                            Sign in on the internal platform
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col style={{ textAlign: "center", margin: "20px 0" }}>
                        <FacebookLogin
                            appId="1146881102489398"
                            fields="name,email,picture"
                            icon={<FacebookIcon style={{ marginBottom: '-6px', width: '25px' }} />}
                            size="small"
                            onClick={componentClicked}
                            callback={responseFacebook}
                        />
                        {/* <FbLogin /> */}
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p
                            style={{
                                textAlign: 'center',
                                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                                fontWeight: 400,
                                fontSize: '0.875rem',
                                color: '#6b778c'
                            }}
                        >
                            or signin with email address
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Form onSubmit={onSubmit}>
                            <FormGroup controlId="formBasicEmail">
                                <FormControl
                                    type="email"
                                    placeholder="Email Address"
                                    onChange={(e) => { setWrong(false); setEmail(e.target.value); }}
                                    value={email}
                                />
                            </FormGroup>

                            <FormGroup controlId="formBasicPassword">
                                <FormControl
                                    type="password"
                                    placeholder="Password"
                                    onChange={(e) => { setWrong(false); setPassword(e.target.value); }}
                                    value={password}
                                />
                            </FormGroup>

                            <Alert variant="danger" style={{ display: wrong ? "block" : 'none' }}>Email or password is incorrect</Alert>

                            <button type="submit" className="btn-submit">
                                SIGN IN NOW
                            </button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>);
};

export default Login;