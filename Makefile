.PHONY: test test-unit test-integration test-e2e test-coverage

# Run all tests
test:
    pytest

# Run only unit tests
test-unit:
    pytest -m unit

# Run only integration tests
test-integration:
    pytest -m integration

# Run only e2e tests
test-e2e:
    pytest -m e2e

# Run tests with coverage
test-coverage:
    pytest --cov=api --cov-report=html --cov-report=term

# Run tests in parallel
test-parallel:
    pytest -n auto

# Run specific test file
test-file:
    pytest $(FILE) -v

# Run tests and generate report
test-report:
    pytest --html=reports/report.html --self-contained-html