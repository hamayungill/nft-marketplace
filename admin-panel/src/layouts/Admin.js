import React, { Component } from "react";
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footers/AdminFooter";
import Sidebar from "components/Sidebar/Sidebar";
import routes from "routes.js";
import { ENV } from '../config/config';
import { setWalletError } from '../redux/shared/error/error.action';
import image3 from "assets/img/tablecloth.svg";

class Admin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			routes: routes
		};
	}

	componentDidMount() {
		console.log("here in mount");
		if (localStorage.getItem("walletError")) {
			let err = localStorage.getItem("walletError")
			this.props.setWalletError(err)
		} else {

		}
	}

	getBrandText = path => {
		for (let i = 0; i < routes.length; i++) {
			if (
				this.props.location.pathname.indexOf(
					routes[i].path
				) !== -1
			) {
				return routes[i].name;
			}
		}
		return "Not Found";
	};
	componentDidUpdate(e) {
		if (
			window.innerWidth < 993 &&
			e.history.location.pathname !== e.location.pathname &&
			document.documentElement.className.indexOf("nav-open") !== -1
		) {
			document.documentElement.classList.toggle("nav-open");
		}
		if (e.history.action === "PUSH") {
			document.documentElement.scrollTop = 0;
			document.scrollingElement.scrollTop = 0;
			this.refs.mainPanel.scrollTop = 0;
		}
	}
	render() {
		return (
			<>
				{
					this.props?.walletError ?
						<div className="warning-section">
							<div className="warning-text">
								{this.props?.walletError}
							</div>
						</div>
						: ''
				}
				<div className={`wrapper`}>
					<Sidebar {...this.props} routes={this.state.routes} image={image3} background={'black'} />
					<div id="main-panel" className="main-panel" ref="mainPanel">
						<AdminNavbar {...this.props} brandText={this.getBrandText(this.props.location.pathname)} history={this.props.history} />
						<div className="content">
							{this.props.children}
						</div>
						<Footer />
					</div>
				</div>
			</>
		);
	}
}

const mapStateToProps = state => ({
	walletError: state.error?.walletError
})
export default connect(mapStateToProps, { setWalletError })(Admin);
