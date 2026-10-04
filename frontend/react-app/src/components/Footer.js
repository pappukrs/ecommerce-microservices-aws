import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} eCommerce Store</span>
        <span className="footer-stack">
          Runs on AWS: CloudFront, API Gateway, ECS Fargate, DynamoDB, RDS
        </span>
      </div>
    </footer>
  );
}

export default Footer;
