import React from "react";
import { motion } from "framer-motion";
import "./sidenav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlusCircle, faEye, faBars, faRightFromBracket, faBuilding, faChartBar, faBriefcase, faLayerGroup, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const sidebarVariants = {
  open: { width: "200px" },
  closed: { width: "60px" },
};

const linkVariants = {
  open: { opacity: 1, display: "inline-block" },
  closed: { opacity: 0, display: "none" },
};

function Sidebarcomp() {
  const [isOpen, setIsOpen] = React.useState(true);
  const role = parseInt(sessionStorage.getItem("userRole") || "0");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      className="sidebar"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
    >
      <div className="toggle-btn" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </div>
      <ul>
        {/* Role 2 (SuperAdmin) menu */}
        {role === 2 && (
          <>
            <li>
              <Link to="/admin/superadmin">
                <FontAwesomeIcon icon={faChartBar} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>SuperAdmin</motion.span>
              </Link>
            </li>
            <li>
              <Link to="/admin/businesses">
                <FontAwesomeIcon icon={faBriefcase} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Businesses</motion.span>
              </Link>
            </li>
            <li>
              <Link to="/admin/assessment-batches">
                <FontAwesomeIcon icon={faLayerGroup} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Batches</motion.span>
              </Link>
            </li>
            <li>
              <Link to="/admin/batch-progress">
                <FontAwesomeIcon icon={faChartLine} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Progress</motion.span>
              </Link>
            </li>
          </>
        )}

        {/* Role 1 (Admin) menu */}
        {role === 1 && (
          <>
            <li>
              <Link to="/admin/dashboard">
                <FontAwesomeIcon icon={faHome} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Dashboard</motion.span>
              </Link>
            </li>
            <li>
              <Link to="/admin/create-test">
                <FontAwesomeIcon icon={faPlusCircle} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Create Test</motion.span>
              </Link>
            </li>
            <li>
              <Link to="/admin/clients">
                <FontAwesomeIcon icon={faBuilding} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Clients</motion.span>
              </Link>
            </li>
          </>
        )}

        <li>
            <Link to="/">
                <FontAwesomeIcon icon={faRightFromBracket} className="mx-1 text-light" />
                <motion.span variants={linkVariants}>Logout</motion.span>
            </Link>
        </li>
      </ul>
    </motion.div>
  );
}

export default Sidebarcomp;

