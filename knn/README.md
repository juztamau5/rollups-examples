# k-NN DApp

This example implements a simple Machine Learning classification algorithm within a Cartesi Rollups DApp.

In this DApp, we use the [k-Nearest Neighbor algorithm](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) to predict the class of a given input based on a previously known dataset of samples.

We use the classic [Iris flower dataset](https://en.wikipedia.org/wiki/Iris_flower_data_set), which contains 3 classes of 50 instances each, where each class refers to a species of the [Iris flower](<https://en.wikipedia.org/wiki/Iris_(plant)>).
One class is linearly separable from the other two, however the latter are NOT linearly separable from each other.
The actual data used in this example is available [here](https://archive.ics.uci.edu/ml/datasets/iris).

When starting the application while building the machine, the k-NN classification algorithm is evaluated on the dataset using cross-validation, showing the expected accuracy of the classifier.

```log
[1970-01-01 00:00:15,947] INFO in knn: Loading Iris Dataset
[1970-01-01 00:00:15,983] INFO in knn: Class mapping from dataset: {'Iris-setosa': 0, 'Iris-versicolor': 1, 'Iris-virginica': 2}
[1970-01-01 00:00:24,482] INFO in knn: Accuracies for k-NN in each cross-validation fold: [96.66666666666667, 96.66666666666667, 100.0, 90.0, 100.0]
[1970-01-01 00:00:24,486] INFO in knn: Mean accuracy for k-NN in the dataset: 96.66666666666667
```

Once started, the DApp will receive input samples and predict its classification. The inputs should contain the following attribute information for an Iris flower:

1. Sepal length in cm
2. Sepal width in cm
3. Petal length in cm
4. Petal width in cm

Each input should be given as a JSON string, such as the following:

```json
{ "sl": 4.9, "sw": 3.0, "pl": 1.4, "pw": 0.3 }
```

Where `sl` represents the sepal length, `sw` is the sepal width, `pl` is the petal length and `pw` is the petal width.

## Interacting with the application

We can use the [frontend-console](../frontend-console) application to interact with the DApp.
Ensure that the [application has already been built](../frontend-console/README.md#building) before using it.

First, go to a separate terminal window and switch to the `frontend-console` directory:

```shell
cd frontend-console
```

Then, send an input as follows:

```shell
yarn start input send --payload '{"sl": 4.9, "sw": 3.0, "pl": 1.4, "pw": 0.3}'
```

In order to verify the notices generated by your inputs, run the command:

```shell
yarn start notice list
```

The response should be something like this:

```json
[{ "epoch": "0", "input": "1", "notice": "0", "payload": "Iris-setosa" }]
```

The payload corresponds to the Iris flower species class predicted by the k-NN algorithm.

## Running the environment in host mode

When developing an application, it is often important to easily test and debug it. For that matter, it is possible to run the Cartesi Rollups environment in [host mode](../README.md#host-mode), so that the DApp's back-end can be executed directly on the host machine, allowing it to be debugged using regular development tools such as an IDE.

This DApp's back-end is written in Python, so to run it in your machine you need to have `python3` installed.

In order to start the back-end, run the following commands in a dedicated terminal:

```shell
cd knn/
python3 -m venv .env
. .env/bin/activate
pip install -r requirements.txt
ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 knn.py
```

The final command will effectively run the back-end and send corresponding outputs to port `5004`.
It can optionally be configured in an IDE to allow interactive debugging using features like breakpoints.

You can also use a tool like [entr](https://eradman.com/entrproject/) to restart the back-end automatically when the code changes. For example:

```shell
ls *.py | ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" entr -r python3 knn.py
```

After the back-end successfully starts, it should print an output like the following:

```log
INFO:__main__:HTTP rollup_server url is http://127.0.0.1:5004
INFO:__main__:Loading Iris Dataset
INFO:__main__:Class mapping from dataset: {'Iris-setosa': 0, 'Iris-versicolor': 1, 'Iris-virginica': 2}
INFO:__main__:Accuracies for k-NN in each cross-validation fold: [96.66666666666667, 96.66666666666667, 100.0, 90.0, 100.0]
INFO:__main__:Mean accuracy for k-NN in the dataset: 96.66666666666667
INFO:__main__:Sending finish
```

After that, you can interact with the application normally [as explained above](#interacting-with-the-application).
