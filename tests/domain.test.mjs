import test from "node:test";
import * as E from "../src/domain.mjs";
import {cases} from "./cases.mjs";
for(const [name,run]of cases(E))test(name,run);
