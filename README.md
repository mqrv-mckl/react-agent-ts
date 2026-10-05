# ReAct Agent (TS)

A minimal demonstration of a [ReAct](https://doi.org/10.48550/arXiv.2210.03629) agent that uses tool calls to act in a simulated environment.

## Overview

The agent follows the ReAct approach: it alternated between reasoning about the task and calling tools, and it uses the results of those calls to decide on its next step.

The environment it acts in is a deliberately very minimal simulation of a web app builder. It provides only the bare minimum needed to illustrate how tool calls work, so it is not meant to be a realistic or complete builder.

Parts of the implementation are inspired by:

- [mattmbrogi/agent-implementation](https://github.com/mattmbrogi/agent-implementation/)
- [ReAct Agent pattern (TypeScript)](https://codesociety.net/patterns/agentic/react-agent/typescript/)

## Structure

- `src/agent`: agent logic (ReAct loop, tool call handling)
- `src/environment`: files that simulate the web app builder environment and the tools the agent can call

## Model

The project was developed and tested with [llama.cpp](https://github.com/ggml-org/llama.cpp) and a quantized Qwen3.8 model: [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF).
