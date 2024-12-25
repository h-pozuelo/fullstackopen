import React, { useEffect, useState } from "react";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import personService from "./services/persons";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState(null);
  const [variant, setVariant] = useState("success");

  useEffect(() => {
    personService.getAll().then((data) => setPersons(data));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    const personFound = persons.find((person) => person.name === newName);

    if (personFound) {
      if (
        !window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      )
        return;

      personService
        .update(personFound.id, { ...personFound, number: newNumber })
        .then((data) => {
          setPersons((prev) =>
            prev.map((p) => (p.id !== personFound.id ? p : data))
          );

          setVariant("success");
          setMessage(`Updated ${data.name}`);
          setTimeout(() => setMessage(null), 5000);
        })
        .catch((error) => {
          setVariant("warning");
          setMessage(
            `Information of ${personFound.name} has already been removed from server`
          );
          setTimeout(() => setMessage(null), 5000);
        });
      return;
    }

    const personObject = {
      name: newName,
      number: newNumber,
      // id: persons.length + 1,
    };

    personService
      .create(personObject)
      .then((data) => {
        setPersons((prev) => prev.concat(data));

        setVariant("success");
        setMessage(`Added ${data.name}`);
        setTimeout(() => setMessage(null), 5000);

        setNewName("");
        setNewNumber("");
      })
      .catch((error) => {
        setVariant("warning");
        setMessage(error.response.data.error);
        setTimeout(() => setMessage(null), 5000);
      });
  };

  const handleFilter = (event) => setFilter(event.target.value);

  const handleName = (event) => setNewName(event.target.value);

  const handleNumber = (event) => setNewNumber(event.target.value);

  const includesCaseInsensitive = (str, searchString) =>
    new RegExp(searchString, "i").test(str);

  const filteredPersons = persons.filter((person) =>
    includesCaseInsensitive(person.name, filter)
  );

  const handleDelete = (id) => {
    const personName = persons.find((person) => person.id === id).name;

    if (!window.confirm(`Delete ${personName}?`)) return;

    personService
      .deletePerson(id)
      .then((data) =>
        setPersons((prev) => prev.filter((person) => person.id !== id))
      )
      .catch((error) => {
        setVariant("warning");
        setMessage(
          `Information of ${personName} has already been removed from server`
        );
        setTimeout(() => setMessage(null), 5000);
      });
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} variant={variant} />
      <Filter value={filter} onChange={handleFilter} />
      <h2>add a new</h2>
      <PersonForm
        onSubmit={handleSubmit}
        nameValue={newName}
        onNameChange={handleName}
        numberValue={newNumber}
        onNumberChange={handleNumber}
      />
      <h2>Numbers</h2>
      <Persons persons={filteredPersons} onDelete={handleDelete} />
    </div>
  );
};

export default App;
