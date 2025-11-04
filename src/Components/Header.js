function Header(){
    return(
        <div className="row m-0 px-5 bg-white shadow-sm">
            <div className="container">                
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container">
                        <a className="navbar-brand px-4" href="#">ZEE TRAVELO</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item px-3">
                                    <a className="nav-link active" aria-current="page" href="#">HOME</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">FLIGHTS</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">HOTELS</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">TOURS</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">CARS</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">CRUISE</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">BUSES</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">ABOUT</a>
                                </li>
                                <li className="nav-item px-3">
                                    <a className="nav-link" href="#">CONTACT</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default Header;