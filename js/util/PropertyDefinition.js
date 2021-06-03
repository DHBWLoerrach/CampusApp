export default class PropertyDefinition {

    required = false;
    value = "";
    name = null;
    validated = false;

    constructor(name) {
        this.name = name;
    }

    shouldInstantBeValidated() {
        this.validated = true;
        return this;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setValue(val) {
        this.value = val;
        return this;
    }

    isRequired() {
        this.required = true;
        return this;
    }





}