const apiKey =
  "47659afe341aa8d88b5916df968b062d17e0371619c47c3c9aaa2ea69ad7bbcd";
const coinRankingUrl =
  "https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0";
let isConvertingToFiat = true;

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
      option.textContent = crypto.name;
      // crypto image
      const img = document.createElement("img");
      img.src = crypto.iconUrl;
      img.classList.add("w-4", "h-4", "inline-block", "mr-2");
      option.prepend(img);

      option.addEventListener("click", () => {
        document.getElementById("cryptoSelect").value = crypto.symbol; // Set the selected value
        document.getElementById(
          "cryptoSelectBtn"
        ).textContent = `${crypto.name}`;
        toggleCryptoSelect(); // Hide the dropdown after selecting an option
      });
      cryptoSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    cryptoSelect.innerHTML = "<div>Error fetching data</div>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateCryptoSelect();
  populateTargetCurrencySelect();
});

async function populateTargetCurrencySelect() {
  const targetCurrencySelect = document.getElementById("targetCurrencySelect");

  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();
    console.log(data);
    const currencies = Object.keys(data.rates);

    currencies.forEach((currency) => {
      const option = document.createElement("option");
      option.value = currency;
      option.classList.add(
        "cursor-pointer",
        "p-2",
        "transition",
        "duration-300",
        "hover:bg-neutral-200",
        "ease-in-out"
      );
      option.textContent = currency;
      // currency image
      const img = document.createElement("img");
      option.addEventListener("click", () => {
        document.getElementById("targetCurrencySelect").value = currency; // Set the selected value
        document.getElementById(
          "targetCurrencySelectBtn"
        ).textContent = `${currency}`;
        toggleTargetCurrencySelect(); // Hide the dropdown after selecting an option
      });
      targetCurrencySelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    targetCurrencySelect.innerHTML = "<option>Error fetching data</option>";
  }
}

function performConversion() {
  const selectedCrypto = document.getElementById("cryptoSelect").value;
  const targetCurrency = document.getElementById("targetCurrencySelect").value;
  const cryptoAmount = document.getElementById("cryptoAmount").value;
  const resultInput = document.getElementById("result");

  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=${selectedCrypto}&tsyms=${targetCurrency}&api_key=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      const rate = data[targetCurrency];
      const result = isConvertingToFiat
        ? cryptoAmount * rate
        : parseFloat(resultInput.value) / rate;

      if (isConvertingToFiat) {
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
