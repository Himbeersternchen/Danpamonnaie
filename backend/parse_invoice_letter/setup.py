from setuptools import find_packages, setup

setup(
    name="parse_invoice_letter",
    version="0.1.0",
    packages=find_packages(exclude=["tests", "*.tests", "*.tests.*"]),
    python_requires=">=3.12.3",
    install_requires=[
        "Django>=5.2.4",
        "pandas>=2.3.1",
    ],
    author="Himbeersternchen",

    description="Shared utilities for Django project",
    long_description="Process data and store them into database",
)
