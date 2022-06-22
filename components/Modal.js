import {motion} from 'framer-motion'
import Backdrop from './Backdrop.js'



const dropIn = {
    hidden: {
        y: '100vh',
        opacity: 0,
    },
    visible:{
        y: '0',
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 30,
            stiffness: 350,
        }
    },
    exit:{
        y: '100vh',
        opacity: 0
    }
}


const Modal = ({handleClose}) => {
    return (
        <Backdrop onClick={handleClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className='modal'   
                variants={dropIn}
                initial='hidden'
                animate='visible'
                exit='exit'
                >
                <div className='modalHeader'>
                    <h1>About</h1>
                </div>
                <div className='modalBody'>
                    <h2>What is Sonus?</h2>
                    <p>Sonus is a tool to scan for similarities between Spotify playlists.</p>
                    <h2>How do I use Sonus?</h2>
                    <p>Just put in links for the playlists you want to compare in their respective boxes and hit the compare button!</p>
                    {/* <h2>This sucks. Make it better.</h2>
                    <p>Sorry to hear that! Feedback is important. Please contact me if you think anything can be improved.</p>
                    <h2>Check out my other projects!</h2>
                    <p></p> */}

                </div>
                <motion.button
                    className= 'modalButton'
                    onClick= {handleClose}
                    whileHover=  {{ color: '#e05b64'}}
                    whileTap={{ scale: .95  }}
                >Close
                </motion.button>
            </motion.div>
        </Backdrop>
      );
}
 
export default Modal;