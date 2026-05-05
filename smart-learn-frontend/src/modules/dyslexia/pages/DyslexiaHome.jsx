import { useNavigate } from 'react-router-dom';

const DyslexiaHome = () => {
	const navigate = useNavigate();

	return (
		<main className='page-shell' style={{ 
			background: "linear-gradient(135deg, #FF6B9D 0%, #FFC43F 25%, #6BCB77 50%, #4D96FF 75%, #D946FF 100%)",
			minHeight: "100vh",
			overflow: "auto",
			position: "relative",
			padding: "40px 20px"
		}}>
			<section className='container' style={{ maxWidth: "1000px", margin: "0 auto" }}>
				<div className='hero' style={{
					textAlign: "center",
					marginBottom: "60px"
				}}>
					<h1 className='page-title' style={{
						fontSize: "56px",
						color: "white",
						textShadow: "0 4px 15px rgba(0,0,0,0.3)",
						marginBottom: "20px"
					}}>
						📖 සෙල්ලම් කරමු 📖
					</h1>
					
				</div>

				{/* Games Grid */}
				<div style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "30px",
					marginBottom: "40px"
				}}>
					{/* Game 1: Garden Journey */}
					<div
						onClick={() => navigate('/dyslexia/garden-journey')}
						style={{
							background: "linear-gradient(135deg, rgba(255, 107, 157, 0.95) 0%, rgba(255, 196, 63, 0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>🌳🎵</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							ගෙවත්තේ චාරිකාවය
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							🎧 සතා ශබ්දය අසා හඳුනාගමු!
						</p>
					</div>

					{/* Game 2: Image Matcher */}
					<div
						onClick={() => navigate('/dyslexia/image-matcher')}
						style={{
							background: "linear-gradient(135deg, rgba(107, 203, 119, 0.95) 0%, rgba(77, 150, 255, 0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out 0.1s both"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>🎨🖼️</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							පින්තූර ගලපමුු
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							🖌️ සමාන පින්තූර සොයා ගනිමු!
						</p>
					</div>

					{/* Game 3: Image Hunt */}
					<div
						onClick={() => navigate('/dyslexia/image-hunt')}
						style={{
							background: "linear-gradient(135deg, rgba(255, 184, 0, 0.95) 0%, rgba(255, 107, 157, 0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out 0.2s both"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>🔍🖼️</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							පින්තූර සොයා ගනිමු
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							🎯 බොහෝ පින්තූරෙ නිල් පින්තූරය සොයා ගන්න!
						</p>
					</div>

					{/* Game 4: Odd One Out */}
					<div
						onClick={() => navigate('/dyslexia/odd-one-out')}
						style={{
							background: "linear-gradient(135deg, rgba(0,217,255,0.95) 0%, rgba(255,184,0,0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out 0.25s both"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>🧐🍎</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							වෙනස් පින්තූරය සොයන්න
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							🔎 සමාන රූප අතර වෙනස් එක තෝරන්න!
						</p>
					</div>

					{/* Game 5: Letter Pronunciation */}
					<div
						onClick={() => navigate('/dyslexia/letter-pronunciation')}
						style={{
							background: "linear-gradient(135deg, rgba(217, 70, 255, 0.95) 0%, rgba(255, 107, 157, 0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out 0.3s both"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>🔤🎤</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							අකුරු කියමු
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							🎧 අකුරු උච්චාරණය කරමු!
						</p>
					</div>

					{/* Game 5: Letter Listening */}
					<div
						onClick={() => navigate('/dyslexia/letter-listening')}
						style={{
							background: "linear-gradient(135deg, rgba(77, 150, 255, 0.95) 0%, rgba(217, 70, 255, 0.95) 100%)",
							borderRadius: "30px",
							padding: "40px 30px",
							textAlign: "center",
							boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
							border: "6px solid white",
							cursor: "pointer",
							transition: "all 0.3s",
							animation: "slideInUp 0.8s ease-out 0.4s both"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
							e.currentTarget.style.boxShadow = "0 30px 70px rgba(0,0,0,0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0) scale(1)";
							e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.2)";
						}}
					>
						<div style={{ fontSize: "80px", marginBottom: "20px" }}>👂🔤</div>
						<h2 style={{
							fontSize: "32px",
							color: "white",
							margin: "0 0 15px 0",
							fontWeight: "bold",
							textShadow: "0 2px 8px rgba(0,0,0,0.2)"
						}}>
							අකුරු තෝරමු
						</h2>
						<p style={{
							fontSize: "18px",
							color: "white",
							margin: "0",
							fontWeight: "500",
							textShadow: "0 1px 4px rgba(0,0,0,0.2)"
						}}>
							📢 අකුරු අසා තෝරා ගනිමු!
						</p>
					</div>
				</div>
			</section>

			<style>{`
				@keyframes slideInUp {
					from { opacity: 0; transform: translateY(40px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</main>
	);
};

export default DyslexiaHome;
