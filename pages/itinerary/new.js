import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faBrain } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { AppLayout } from '../../components/AppLayout';
import { getAppProps } from '../../utils/getAppProps';

import { useState, useRef } from "react";

import Linkify from "react-linkify";
import Image from "next/image";
import validator from "validator";
import axios from "axios";

import { jsPDF } from "jspdf";


import Logo2 from "../../assets/logo2.png";
import Duration from '../../components/Inputs/Duration';
import Month from '../../components/Inputs/Month';
import UserInput from '../../components/Inputs/UserInput';

// import {
//   IconCircleNumber1,
//   IconCircleNumber2,
//   IconCircleNumber3,
//   IconCircleNumber4,
// } from "@tabler/icons";


const options = {
  orientation: 'landscape',
  unit: 'in',
  format: [4, 2]
};

const componentDecorator = (href, text, key) => (
  <a className="linkify__text" href={href} key={key} target="_blank">
    {text}
  </a>
);

const months = [
  "Mes",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const subject = "Tu itinerario ya esta generado";

const NewItinerary = () => {
  const router = useRouter();
  const [duration, setDuration] = useState(3);
  const [userInput, setUserInput] = useState("");
  const [apiOutput, setApiOutput] = useState("");
  const [info, setInfo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Cualquier mes");

  const divRef = useRef(null);

  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk] = useState("");
  const validateEmail = (e) => {
    var email = e.target.value;

    if (validator.isEmail(email)) {
      setEmailError("Email Correcto!:)");
      setEmailOk(e.target.value);
    } else {
      setEmailError("Email no v??lido!");
    }
  };

  const scrollToDiv = () => {
    window.scrollTo({
      top: divRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  const callGenerateEndpoint = async (e) => {

    e.preventDefault();
    setIsGenerating(true);

    setIsGenerating(true);

    //     let prompt = `Por favor, genere un itinerario detallado para un viaje de ${duration} d??as a ${userInput} en el pr??ximo ${selectedMonth}, 
    // 	 incluyendo la programaci??n horaria de todas las actividades, atracciones y comidas.
    // Aseg??rese de que el itinerario incluya una mezcla de atracciones tur??sticas populares, experiencias locales y tiempo para relajarse. 
    // Adem??s, incluya sugerencias para el almuerzo y la cena en una variedad de restaurantes diferentes para experimentar la diversa escena culinaria de la ciudad. 
    // Incluya la descripici??n, el rango de precios y un enlace a su Web oficial para cada restaurante y atracci??n sugerida.
    // Mantenga un ??rea de viaje m??xima del tama??o de Hokkaido, si es posible, para minimizar el tiempo de viaje entre ciudades.
    // Finalmente describe el clima en ese mes, y tambi??n 3 cosas para tomar nota sobre la cultura de ese pa??s.`;
    let prompt = `Por favor, genere un itinerario detallado para un viaje de ${duration} d??as a ${userInput} en el pr??ximo ${selectedMonth}`;

    try {
      const response = await fetch(`/api/generateItinerary`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ prompt, userInput }),
      });
      const json = await response.json();
      console.log('RESULT: ', json);
      if (json?.itineraryId) {
        router.push(`/itinerary/${json.itineraryId}`);
      }
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const emailContent = apiOutput + info;

  const pdfDownload = (e) => {
    e.preventDefault()
    let doc = new jsPDF("landscape", 'pt', 'A4');
    const content = document.getElementById("pdf-view");

    // Ajustar el tama??o de fuente del contenido HTML para que quepa en una sola p??gina
    content.style.fontSize = "12px";

    // Opcional: ajustar la escala de la p??gina si el contenido no cabe en una sola p??gina
    const options = {
      callback: () => {
        doc.save("freeplantour.pdf");
      },
      x: 5,
      y: 5,
      html2canvas: { scale: 0.8 }
    };

    // Generar el PDF
    doc.html(content, options);
    console.log(content)
  };


  return (
    <div className="root">
      <div className="flex max-[600px]:flex-col w-full">

        <div className="container-left">
          <div class="row">
            <a href="https://gestat.io/" target="_blank" rel="noreferrer">
              <div class="column">
                <Image
                  src={Logo2}
                  alt="Free Plan Tour"
                  style={{ opacity: "0.8" }}
                />
              </div>
            </a>
            <div class="column">
              <h2>
                <br />
                Cu??ntanos tu viaje y tendr??s un itinerario personalizado al
                instante. Como no hay 2 viajes iguales, cada gu??a generada es
                ??nica.
              </h2>
            </div>
          </div>

          <div className="prompt-container">

            <UserInput userInput={userInput} setUserInput={setUserInput} />

            <div className="flex w-100 mt-4">
              
              <Duration duration={duration} setDuration={setDuration} />

              <Month months={months} setSelectedMonth={setSelectedMonth} selectedMont={selectedMonth} />
            </div>

            <div className="prompt-buttons">
              <button
                className="pushable py-2 px-4 rounded"
                onClick={callGenerateEndpoint}
                disabled={isGenerating}
              >
                <span className="shadow"></span>
                <span className="edge"></span>
                <div className="front">
                  {isGenerating ? (
                    <div>
                      <span className="loader mr-2"></span>
                      <span>
                        ...PREPARANDO...
                        <br />
                        Cuando ya no veas esto
                        <br />
                        tu gu??a aparecer?? en la siguiente p??gina
                        <br />
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold">Generar</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NewItinerary;

NewItinerary.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

    console.log('CTX: ', ctx)

    // console.log('PROPS: ', props.availableTokens)

    if (!props.availableTokens) {
      return {
        redirect: {
          destination: '/token-topup',
          permanent: false,
        },
      };
    }

    return {
      props,
    };
  },
});
