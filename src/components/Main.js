import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col
} from "react-bootstrap";
import Positive from "../assets/images/Positive.png";
import Neutral from "../assets/images/Neutral.png";
import Negative from "../assets/images/Negative.png";

import "../assets/css/Main.css";

const Main = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analyze, setAnalyze] = useState(false);
    const [postUrl, setPostUrl] = useState('');
    const [positive, setPositive] = useState(0.333);
    const [neutral, setNeutral] = useState(0.333);
    const [negative, setNegative] = useState(0.333);
    // eslint-disable-next-line no-unused-vars
    // const [compound, setCompound] = useState(0.333);

    useEffect(() => {
        axios.get('http://localhost:5000/api/user/find', {
            headers: {
                'Access-Control-Allow-Origin': true,
                'x-access-token': localStorage.getItem('token')
            },
            params: {
                userId: localStorage.getItem('userId'),
                loginWithFB: localStorage.getItem('loginWithFB')
            }
        }).then((res) => {
            console.log(res.data);
            // eslint-disable-next-line no-undef
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
                var URL = tabs[0].url;
                var domain = tabs[0].url.hostname;
                console.log(domain);
                if (URL.includes('https://m.facebook.com/')) {
                    setPostUrl(URL);
                    handleAnalyze(URL);
                }
                else if (URL.includes('https://www.facebook.com/')) {
                    URL = URL.replace('www.', 'm.');
                    setPostUrl(URL);
                    handleAnalyze(URL);
                }
            });

        }).catch((err) => {
            if (err.response.status === 400 || err.response.status === 401 || err.response.status === 403) {
                console.log(err.response.message);
                navigate('/login', { replace: true });
            } else {
                console.log(err);
            }
        });
    }, []);

    const handleAnalyze = (postUrl) => {
        if (postUrl) {
            setError(false);
            setLoading(true);
            setAnalyze(true);

            axios.get('http://localhost:5000/api/posts/find', {
                headers: {
                    'Access-Control-Allow-Origin': true,
                    'x-access-token': localStorage.getItem('token')
                },
                params: {
                    id: postUrl,
                    loginWithFB: localStorage.getItem('loginWithFB')
                }
            })
                .then((findPostResponse) => {
                    console.log(findPostResponse.data);

                    const totalComments = findPostResponse.data.comments.length;
                    let sumPositive = 0;
                    let sumNeutral = 0;
                    let sumNegative = 0;
                    // let sumCompound = 0;
                    for (let i = 0; i < findPostResponse.data.comments.length; i++) {
                        sumPositive += findPostResponse.data.comments[i].object.pos;
                        sumNeutral += findPostResponse.data.comments[i].object.neu;
                        sumNegative += findPostResponse.data.comments[i].object.neg;
                    }
                    setPositive(sumPositive / totalComments);
                    setNeutral(sumNeutral / totalComments);
                    setNegative(sumNegative / totalComments);
                    setLoading(false);
                    setAnalyze(false);
                })
                .catch((findPostError) => {
                    if (findPostError.response.status === 401 || findPostError.response.status === 403) {
                        console.log(findPostError.response.message);
                        setLoading(false);
                        navigate('/login', { replace: true });
                    } if (findPostError.response.status === 404) {
                        console.log(findPostError.response.message);

                        axios.post(`http://localhost:8000/?data=${postUrl}`)
                            .then((djangoRes) => {
                                console.log(djangoRes);
                                const objects = Object.values(djangoRes.data);
                                const array = Object.keys(djangoRes.data).map((key, index) => (
                                    { name: key, object: objects[index] }
                                ));
                                console.log(array);
                                if (!array.length) {
                                    setError(true);
                                    setLoading(false);
                                } else {
                                    const totalComments = array.length;
                                    let sumPositive = 0;
                                    let sumNeutral = 0;
                                    let sumNegative = 0;
                                    for (let i = 0; i < array.length; i++) {
                                        sumPositive += array[i].object.pos;
                                        sumNeutral += array[i].object.neu;
                                        sumNegative += array[i].object.neg;
                                    }
                                    setPositive(sumPositive / totalComments);
                                    setNeutral(sumNeutral / totalComments);
                                    setNegative(sumNegative / totalComments);
                                    setLoading(false);
                                    setAnalyze(false);

                                    // Save result in MongoDB
                                    axios.post('http://localhost:5000/api/posts/save', {
                                        id: postUrl,
                                        comments: array,
                                        loginWithFB: localStorage.getItem('loginWithFB')
                                    }, {
                                        headers: {
                                            'Access-Control-Allow-Origin': true,
                                            'x-access-token': localStorage.getItem('token'),
                                        }
                                    })
                                        .then((nodeRes) => {
                                            console.log(nodeRes.data);
                                        })
                                        .catch((err) => {
                                            console.log(err.response);
                                            if (err.response.status === 400) {
                                                console.log(err.response.message);
                                            } if (err.response.status === 401 || err.response.status === 403) {
                                                console.log(err.response.message);
                                                navigate('/login', { replace: true });
                                            }
                                        });
                                }
                            })
                            .catch((err) => {
                                console.log(err.response);
                                setError(true);
                                setLoading(false);
                                setAnalyze(false);
                            });
                    }
                });
        }
    };

    const moreResult = () => {
        navigator.clipboard.writeText(postUrl);
        // eslint-disable-next-line no-undef
        chrome.tabs.getCurrent(function (tab) {
            var URL = "https://localhost:3000/app/analyzer";
            // eslint-disable-next-line no-undef
            chrome.tabs.create({ "url": URL });
        });
    }

    return (
        <>
            <div
                className="svg-loader"
                style={{
                    display: loading ? 'flex' : 'none'
                }}
            >
                <div>
                    <div style={{
                        textAlign: 'center',
                        fontFamily: 'system-ui',
                        fontSize: '20px',
                        color: '#273854'
                    }}
                    >
                        Please wait
                    </div>
                    <div style={{ marginTop: '5px' }}>
                        <svg className="svg-containerr" height="100" width="100" viewBox="-2 -2 105 105">
                            <circle className="loader-svg bg" cx="50" cy="50" r="45" />
                            <circle className="loader-svg animate" cx="50" cy="50" r="45" />
                        </svg>
                    </div>
                </div>
            </div>

            <Container style={{ display: !loading && !analyze ? 'block' : 'none' }}>
                <Row>
                    <Col>
                        <div>
                            <img
                                className="img-positive"
                                src={Positive}
                                alt="Positive sentiment"
                            />
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <img
                                className="img-neutral"
                                src={Neutral}
                                alt="Neutral sentiment"
                            />
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <img
                                className="img-negative"
                                src={Negative}
                                alt="Negative sentiment"
                            />
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div className="txt-positive">Positive</div>
                        <div className="percentage-positive">{(positive * 100).toFixed(1)}%</div>
                    </Col>
                    <Col>
                        <div className="txt-neutral">Neutral</div>
                        <div className="percentage-neutral">{(neutral * 100).toFixed(1)}%</div>
                    </Col>
                    <Col>
                        <div className="txt-negative">Negative</div>
                        <div className="percentage-negative">{(negative * 100).toFixed(1)}%</div>
                    </Col>
                </Row>
            </Container>
            <div
                style={{
                    display: (!loading && error) ? 'block' : 'none',
                    textAlign: 'center'
                }}
            >
                URL is not correct OR post doesn&#39t have any comment
            </div>
            <footer
                className="Main-footer"
                style={{
                    display: (!error && !loading && !analyze) ? 'block' : 'none'
                }}
            >
                <button onClick={moreResult}>View more result</button>
            </footer>
        </>
    );
};

export default Main;