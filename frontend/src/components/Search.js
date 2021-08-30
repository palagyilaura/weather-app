import usePlacesAutocomplete from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import useOnclickOutside from "react-cool-onclickoutside";

const Search = () => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here */
            types: ['(cities)']
        },
        debounce: 300,
    });

    const handleInput = (e) => {
        // Update the keyword of the input element
        setValue(e.target.value);
    };
    const ref = useOnclickOutside(() => {
        // When user clicks outside of the component, we can dismiss
        // the searched suggestions by calling this method
        clearSuggestions();
    });

    const handleSelect = (val) => {
        setValue(val, false);
    };

    const renderSuggestions = () => {
        let cities = [];

        for (let i = 0; i < data.length; i++) {
            if ((data[i]["types"]).includes("locality")) {
                cities.push({ key: data[i]["place_id"], city: data[i]["structured_formatting"]["main_text"], country: data[i]["structured_formatting"]["secondary_text"] });
                //console.log(data[i]);
            }
        }
        console.log("data: ", cities);
        const suggestions = cities.map(({ key, city, country }) => (
            <ComboboxOption key={key} value={city + ", " + country} />
        ));

        //console.log(suggestions);
        return (
            <>
                {suggestions}
            </>
        );
    };

    return (
        <div ref={ref}>
            <Combobox onSelect={handleSelect} aria-labelledby="demo">
                <ComboboxInput
                    className="input"
                    style={{ width: 300, maxWidth: "90%" }}
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                />
                <ComboboxPopover>
                    <ComboboxList>{status === "OK" && renderSuggestions()}</ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
};

export default Search;