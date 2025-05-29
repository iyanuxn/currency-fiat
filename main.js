const apiKey = "47659afe341aa8d88b5916df968b062d17e0371619c47c3c9aaa2ea69ad7bbcd";
const coinRankingUrl = "https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0";

let isConvertingToFiat = true;

function toggleFlexDirection() {
  const mainContainer = document.querySelector(".main-container");
  mainContainer.classList.toggle("flex-col");
  mainContainer.classList.toggle("flex-col-reverse");
}

function toggleConversion() {
  isConvertingToFiat = !isConvertingToFiat;
  const convertButton = document.getElementById("convertButton");
  const resultInput = document.getElementById("result");
  const cryptoAmountInput = document.getElementById("cryptoAmount");

  if (isConvertingToFiat) {
    convertButton.textContent = "Convert to Fiat";
    resultInput.setAttribute("readonly", true);
    cryptoAmountInput.removeAttribute("readonly");
  } else {
    convertButton.textContent = "Convert to Crypto";
    cryptoAmountInput.setAttribute("readonly", true);
    resultInput.removeAttribute("readonly");
  }

  toggleFlexDirection(); // Toggle between flex-col and flex-col-reverse
}

const coinRankingOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "2e92a0807fmsh980f8efa545337bp12db81jsnfaa6b1cf03ed",
    "X-RapidAPI-Host": "coinranking1.p.rapidapi.com",
  },
};

async function populateCryptoSelect() {
  const cryptoSelect = document.getElementById("options");

  try {
    const response = await fetch(coinRankingUrl, coinRankingOptions);
    const data = await response.json();

    data.data.coins.forEach((crypto) => {
      const option = document.createElement("div");
      option.classList.add(
        "cursor-pointer",
        "p-2",
        "transition",
        "duration-300",
        "hover:bg-neutral-200",
        "ease-in-out"
      );

      // Create currency option with image
      const currencyOption = createCurrencyOption(crypto.name, crypto.iconUrl);
      option.appendChild(currencyOption);

      option.addEventListener("click", () => {
        const buttonContent = createCurrencyOption(crypto.name, crypto.iconUrl);
        document.getElementById("cryptoSelectBtn").innerHTML = ''; // Clear existing content
        document.getElementById("cryptoSelectBtn").appendChild(buttonContent);
        document.getElementById("cryptoSelect").value = crypto.symbol; // Set the selected value
        toggleCryptoSelect(); // Hide the dropdown after selecting an option
      });

      cryptoSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    cryptoSelect.innerHTML = "<div>Error fetching data</div>";
  }
}

function createCurrencyOption(currency, imgSrc) {
  const container = document.createElement("div");
  container.classList.add("flex", "items-center");
  
  const img = document.createElement("img");
  img.src = imgSrc;
  img.classList.add("w-5", "h-5", "mr-2");

  const text = document.createElement("span");
  text.textContent = currency;

  container.appendChild(img);
  container.appendChild(text);

  return container;
}

async function populateTargetCurrencySelect() {
  const targetCurrencySelect = document.getElementById("options2");

  try {
    // Fetch list of all countries and currencies from REST Countries
    const countriesResponse = await fetch("https://restcountries.com/v3.1/all");
    const countries = await countriesResponse.json();

    // Fetch supported currencies from the conversion API
    const ratesResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const ratesData = await ratesResponse.json();
    const supportedCurrencies = Object.keys(ratesData.rates);

    const currencyToFlagMap = {};

    // Map supported currencies to their flags
    countries.forEach((country) => {
      if (country.currencies) {
        for (const currencyCode in country.currencies) {
          if (supportedCurrencies.includes(currencyCode)) {
            currencyToFlagMap[currencyCode] = country.flags.svg;
          }
        }
      }
    });

    // Populate the dropdown with only supported currencies
    supportedCurrencies.forEach((currency) => {
      const option = document.createElement("div");
      option.classList.add(
        "cursor-pointer",
        "p-2",
        "transition",
        "duration-300",
        "hover:bg-neutral-200",
        "ease-in-out",
        "flex",
        "items-center"
      );

      // Special case for USD
      const imgSrc = currency === "USD" ? "https://flagcdn.com/us.svg" : currencyToFlagMap[currency] || "";
      const currencyOption = createCurrencyOption(currency, imgSrc);
      option.appendChild(currencyOption);

      option.addEventListener("click", () => {
        const buttonContent = createCurrencyOption(currency, imgSrc);
        document.getElementById("targetCurrencySelectBtn").innerHTML = ''; // Clear existing content
        document.getElementById("targetCurrencySelectBtn").appendChild(buttonContent);
        document.getElementById("targetCurrencySelect").value = currency;
        toggleTargetCurrencySelect();
      });

      targetCurrencySelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    targetCurrencySelect.innerHTML = "<div>Error fetching data</div>";
  }
}

function performConversion() {
  const selectedCrypto = document.getElementById("cryptoSelect").value;
  const targetCurrency = document.getElementById("targetCurrencySelect").value;
  const cryptoAmount = document.getElementById("cryptoAmount").value;
  const resultInput = document.getElementById("result");

  fetch(`https://min-api.cryptocompare.com/data/price?fsym=${selectedCrypto}&tsyms=${targetCurrency}&api_key=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      const rate = data[targetCurrency];

      // Check if rate is undefined
      if (!rate) {
        resultInput.value = "Conversion rate unavailable";
        return;
      }

      const result = isConvertingToFiat
        ? cryptoAmount * rate
        : parseFloat(resultInput.value) / rate;

      // Set result with a fixed decimal, or indicate an error if it's NaN
      if (isNaN(result)) {
        resultInput.value = "Invalid conversion";
      } else if (isConvertingToFiat) {
        resultInput.value = result.toFixed(2);
      } else {
        document.getElementById("cryptoAmount").value = result.toFixed(2);
      }
    })
    .catch((error) => {
      console.error(error);
      resultInput.value = "Error fetching data";
    });
}

function toggleCryptoSelect() {
  const cryptoSelect = document.getElementById("cryptoSelect");

  if (cryptoSelect.style.display === "none") {
    cryptoSelect.style.display = "block";
  } else {
    cryptoSelect.style.display = "none";
  }
}

function toggleTargetCurrencySelect() {
  const targetCurrencySelect = document.getElementById("targetCurrencySelect");

  if (targetCurrencySelect.style.display === "none") {
    targetCurrencySelect.style.display = "block";
  } else {
    targetCurrencySelect.style.display = "none";
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  const cryptoSelect = document.getElementById('cryptoSelect');
  const targetSelect = document.getElementById('targetCurrencySelect');
  const cryptoBtn = document.getElementById('cryptoSelectBtn');
  const targetBtn = document.getElementById('targetCurrencySelectBtn');
  
  if (!cryptoBtn.contains(event.target) && !cryptoSelect.contains(event.target)) {
    cryptoSelect.style.display = 'none';
  }
  
  if (!targetBtn.contains(event.target) && !targetSelect.contains(event.target)) {
    targetSelect.style.display = 'none';
  }
});

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  populateCryptoSelect();
  populateTargetCurrencySelect();
});