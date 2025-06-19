import React from "react";
import PropTypes from "prop-types";

const RotatingLines = ({
	size = 200,
	color = "#0079c1",
	strokeWidth = 6,
	duration = 1,
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			preserveAspectRatio="xMidYMid"
			width={size}
			height={size}
			style={{
				shapeRendering: "auto",
				display: "block",
				background: "transparent",
			}}
		>
			<g>
				{Array.from({ length: 8 }).map((_, i) => (
					<g key={i} transform={`rotate(${i * 45} 50 50)`}>
						<rect
							fill={color}
							height="13"
							width={strokeWidth}
							rx="2.6"
							ry="2.6"
							y="23.5"
							x={50 - strokeWidth / 2}
						>
							<animate
								repeatCount="indefinite"
								begin={`-${(7 - i) * (duration / 8)}s`}
								dur={`${duration}s`}
								keyTimes="0;1"
								values="1;0"
								attributeName="opacity"
							/>
						</rect>
					</g>
				))}
			</g>
		</svg>
	);
};

// Prop Types for validation
RotatingLines.propTypes = {
	size: PropTypes.number,
	color: PropTypes.string,
	strokeWidth: PropTypes.number,
	duration: PropTypes.number,
};

const Line = ({
	size = 24,
	color = "#0079c1",
	strokeWidth = 3,
	duration = 1.5,
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
		>
			<g stroke={color}>
				<circle
					cx={12}
					cy={12}
					r={9.5}
					fill="none"
					strokeLinecap="round"
					strokeWidth={strokeWidth}
				>
					<animate
						attributeName="stroke-dasharray"
						calcMode="spline"
						dur={`${duration}s`}
						keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
						keyTimes="0;0.475;0.95;1"
						repeatCount="indefinite"
						values="0 150;42 150;42 150;42 150"
					></animate>
					<animate
						attributeName="stroke-dashoffset"
						calcMode="spline"
						dur={`${duration}s`}
						keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
						keyTimes="0;0.475;0.95;1"
						repeatCount="indefinite"
						values="0;-16;-59;-59"
					></animate>
				</circle>
				<animateTransform
					attributeName="transform"
					dur={`${duration * (2 / 1.5)}s`}
					repeatCount="indefinite"
					type="rotate"
					values="0 12 12;360 12 12"
				></animateTransform>
			</g>
		</svg>
	);
};

Line.propTypes = {
	size: PropTypes.number,
	color: PropTypes.string,
	strokeWidth: PropTypes.number,
	duration: PropTypes.number,
};

export { Line, RotatingLines };