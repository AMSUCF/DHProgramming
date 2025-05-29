## Exercise: Local AI

- [Install Ollama](https://ollama.com/) - Ollama is a command line tool for running open source models locally. (Note that the types of models you can run will depend on your hardware resources.)
- Test Ollama - Using the command line or terminal, run a model and query it. For example, to run a minimized version of DeepSeek r1 locally, use the command: **ollama run deepseek-r1:8b**
- [Install Docker](https://www.docker.com/) - Docker is a tool for handling developer environments: this will allow us to run the Python version, etc, necessary for any particular tool.
- [Install OpenWebUI](https://openwebui.com/) - From the command line, run the command: **docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main**
- Navigate your browser to http://localhost:3000/ and create a sign-in (this is entirely local, so the password can be simple)
- Under Workspace, select Knowledge and add a set of files related to your research or project. Describe the collection and save it. 
- Under Workspace, go to Models and select a model. Scroll down, and add the knowlege set you created earlier.
- Run a chat and query this new, Retrieval-Augmented Generation (RAG) model.
- Docker is now running in your system tray - to pause, stop, and restart this application, use the Docker desktop interface.

Using a model in Copilot requires a more hefty system: however, it uses the same basic tools. Once you've installed a model with Ollama:

- Open Copilot in Visual Studio Code
- Select the current model you are using at the bottom of the chat
- In the menu, click "Manage Models."
- Type "Ollama" as the provider and select
- Select one of the models you have installed - most models will only work in chat mode at this stage, but that is changing fast
